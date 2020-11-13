import React from 'react';
import { Card, CardContent } from '@material-ui/core';
import { gql, useSubscription } from '@apollo/client';
import { client } from '../../App';
import Header from '../Header';
import DashboardHeader from './DashboardHeader';
import Chart from './Chart';

export interface Measurement {
  metric: string;
  at: number;
  value: number;
  unit: string;
}

interface MeasurementSubscription {
  newMeasurement: Measurement;
}

interface MetricNode {
  metric: string;
  measurements: Measurement[];
}

const getMetricNames = async () => {
  const res = await client.query({
    query: gql`
      query {
        getMetrics
      }
    `,
  });
  return res.data.getMetrics;
};

const getDataQuery = (inputQuery: string[]) => {
  return `
 query {
   getMultipleMeasurements(input: [${inputQuery}]){
     metric,
     measurements {
       metric,
       at,
       value,
       unit
     }
   }
 }
`;
};

const measurementsSubscriptionQuery = gql`
  subscription {
    newMeasurement {
      metric
      at
      value
      unit
    }
  }
`;

const minInMilliSec = new Date(Date.now() - 60 * 60000).getTime();
const getInputQuery = (metrics: string[]) => {
  return metrics.map(metric => {
    return `{ metricName: "${metric}", after: ${minInMilliSec} }`;
  });
};

const getMulitpleMeasurementsData = async (metrics: string[]) => {
  const res = await client.query({
    query: gql`
      ${getDataQuery(getInputQuery(metrics))}
    `,
  });
  return res.data.getMultipleMeasurements;
};

const dataFilter = (data: Plotly.Data[], selection: (string | undefined)[]) => {
  let filteredArr = data.filter(metricObj => {
    return selection.includes(metricObj.name);
  });
  filteredArr.push({
    x: [],
    y: [],
    name: '',
    yaxis: 'y',
    type: 'scatter',
    line: { color: '#444' },
  });
  return filteredArr;
};

const transformToChartData = (data: MetricNode[]) => {
  const returnArr: Plotly.Data[] = [];
  const colorArr: string[] = ['#a83a32', '#2d8fa1', '#5ba12d', '#9c2894', '#e6ad8e', '#32403f'];
  data.forEach(metricNode => {
    let metricObj: Plotly.Data = {
      x: [],
      y: [],
      name: '',
      yaxis: '',
      type: 'scatter',
      line: { color: colorArr[data.indexOf(metricNode)] },
    };
    metricNode.measurements.forEach(measurement => {
      (metricObj.x as Plotly.Datum[]).push(new Date(measurement.at));
      (metricObj.y as Plotly.Datum[]).push(measurement.value);
    });
    metricObj.name = metricNode.metric;
    switch (metricNode.measurements[0].unit) {
      case 'F':
        metricObj.yaxis = 'y';
        break;
      case 'PSI':
        metricObj.yaxis = 'y2';
        break;
      case '%':
        metricObj.yaxis = 'y3';
    }
    returnArr.push(metricObj);
  });
  return returnArr;
};

const Dashboard = () => {
  const [metricNames, setMetricNames] = React.useState<string[]>([]);
  const [selection, setSelection] = React.useState<(string | undefined)[]>([]);
  const [initialData, setInitialData] = React.useState<Plotly.Data[]>([]);
  const [filteredData, setFilteredData] = React.useState<Plotly.Data[]>([]);
  const { loading, data } = useSubscription<MeasurementSubscription>(measurementsSubscriptionQuery);
  const [prevSubData, setPrevSubData] = React.useState<Measurement>({ metric: '', at: 0, value: 0, unit: '' });
  const [latestData, setLatestData] = React.useState<Measurement[]>([]);

  React.useEffect(() => {
    const initialFetch = async () => {
      const metricsNamesList = await getMetricNames();
      setMetricNames(metricsNamesList);

      const responseData = await getMulitpleMeasurementsData(metricsNamesList);
      const transformedData = transformToChartData(responseData);
      setInitialData(transformedData);

      let tempData: Measurement[] = [];
      metricsNamesList.forEach((metric: string) => {
        tempData.push({ metric: metric, at: 0, value: 0, unit: '' });
      });
      setLatestData(tempData);
    };
    initialFetch();
  }, []);

  React.useEffect(() => {
    const filteredDataValue = dataFilter(initialData, selection);
    setFilteredData(filteredDataValue);
  }, [initialData, selection]);

  React.useEffect(() => {
    if (
      !loading &&
      data &&
      (data.newMeasurement.at !== prevSubData.at ||
        data.newMeasurement.value !== prevSubData.value ||
        data.newMeasurement.metric !== prevSubData.metric)
    ) {
      let measurementNode = data.newMeasurement;
      let matchingSet = initialData.find(metricNode => metricNode.name === measurementNode.metric);
      if (matchingSet && measurementNode) {
        (matchingSet.x as Plotly.Datum[]).push(new Date(measurementNode.at));
        (matchingSet.y as Plotly.Datum[]).push(measurementNode.value);
        const updatedData = initialData.map(metricNode => {
          if (metricNode.name === measurementNode.metric) {
            return matchingSet;
          } else {
            return metricNode;
          }
        });
        setInitialData(updatedData as Plotly.Data[]);
        if (data) {
          let latestDataTemplate = latestData.map(measurement => {
            return measurement.metric === data.newMeasurement.metric ? data.newMeasurement : measurement;
          });
          setLatestData(latestDataTemplate);
          setPrevSubData(data.newMeasurement);
        }
      }
    }
  }, [initialData, loading, data, prevSubData, latestData]);

  return (
    <Card style={{margin: 24}}>
      <Header/>
      <DashboardHeader
        metrics={metricNames}
        selection={selection}
        setSelection={setSelection}
        latestData={latestData}
      />
      <CardContent style={{ padding: 0, height: 600 }}>
        <Chart data={filteredData} />
      </CardContent>
    </Card>
  );
};

export default Dashboard;

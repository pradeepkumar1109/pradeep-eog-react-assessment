import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { CardContent, Grid } from '@material-ui/core';
import MetricSelect from './MetricSelect';
import { Measurement } from './Dashboard';
import { TempItem } from './MeasurementData';

const useStyles = makeStyles({
  taskBar: {
    backgroundColor: '#fafafa',
  },
});

export default (props: {
  metrics: string[];
  selection: (string | undefined)[];
  setSelection: Function;
  latestData: Measurement[];
}) => {
  const { metrics, selection, setSelection, latestData } = props;
  const classes = useStyles();
  return (
    <CardContent className={classes.taskBar}>
    <Grid container spacing={4} justify="space-between">
      <Grid item xs={12} lg={6}>
        {latestData.map(measurement => {
          return selection.includes(measurement.metric) ? (
            <TempItem key={`${measurement.metric}: ${measurement.value}`} measurement={measurement} />
          ) : null;
        })}
      </Grid>
      <Grid item xs={12} lg={6}>
        <MetricSelect metrics={metrics} selection={selection} setSelection={setSelection} />
      </Grid>
    </Grid>
  </CardContent>
  );
};

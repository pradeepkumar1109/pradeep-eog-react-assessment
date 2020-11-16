import React from 'react';
import { Card, CardContent, Grid, makeStyles, Typography } from '@material-ui/core';
import CardActionArea from '@material-ui/core/CardActionArea';

const useStyles = makeStyles({
  header: {
    backgroundColor: '#fafafa',
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
  },
  mb8: {
    marginBottom: 8,
  },
});

const DashboardHeader = (props: any) => {
  const { metrics, selection, setSelection, latestData } = props;
  const classes = useStyles();

  const handleToggle = (metric: string) => {
    const sel = [...selection];
    const index = sel.indexOf(metric);
    if (index === -1) {
      sel.push(metric);
    } else {
      sel.splice(index, 1);
    }
    setSelection(sel);
  };

  const getValue = (metric: string) => {
    if (selection.indexOf(metric) > -1) {
      const data = latestData.find((m: any) => m.metric === metric);
      return data !== undefined ? `${data.value}${data.unit}` : '';
    }
    return '';
  };

  return (
    <CardContent className={classes.header}>
      <Typography variant="h4" style={{textAlign: 'center', marginBottom: 16}}>Dashboard</Typography>
      <Grid container spacing={2}>
        {metrics.map((metric: string) => (
          <Grid item lg={2} md={2} sm={2} xs={12} key={metric}>
            <Card title="Click to Get Chart">
            <CardActionArea onClick={() => handleToggle(metric)}> 
              <CardContent className={classes.headerContent}>
                <Typography className={classes.mb8}>{metric}</Typography>
                <Typography className={classes.mb8} variant="h5">
                  {getValue(metric)}
                </Typography>
              </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </CardContent>
  );
};

export default DashboardHeader;

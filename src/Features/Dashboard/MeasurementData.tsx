import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { Measurement } from './Dashboard';

const useStyles = makeStyles({
  card: {
    width: '40%',
    margin: '5%',
  },
});

export function TempItem(props: { measurement: Measurement }) {
  const classes = useStyles();
  const { measurement } = props;

  return (
    <Card className={classes.card}>
      <CardContent>
          {`${measurement.metric}: ${measurement.value}${measurement.unit}`}
      </CardContent>
    </Card>
    )
}

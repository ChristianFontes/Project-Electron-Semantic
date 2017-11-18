import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Message, Grid, Button, Icon, Input } from 'semantic-ui-react'
import moment from 'moment';
import Header from './Header';
import { auth, db } from './../../firebase/constants';

export default class Dashboard extends Component {

  componentWillMount() {
    document.body.style.background = 'url(images/background.jpg)';
  }

  render() {
    let { id, nombre } = this.props.user;
    return (
      <Grid
        textAlign='center'
        verticalAlign='middle'
      >
        <Grid.Row columns={1}>
          <Grid.Column>
            <Header id={id} nombre={nombre} user={this.props.user}/>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

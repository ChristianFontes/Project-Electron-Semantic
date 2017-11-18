import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios'
import { push } from 'react-router-redux';
import { Button, Form, Grid, Header, Image, Input, Message, Segment } from 'semantic-ui-react'
import { api } from '../../firebase/constants';

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      errorEmail: false,
      errorPassword: false,
      errorMessage: ''
    };
  }

  static propTypes = {
    onLogin: PropTypes.func.isRequired,
    goSignUp: PropTypes.func.isRequired
  };

  goSignUp = () => {
    this.props.goSignUp();
  }

  componentWillMount() {
    document.body.style.background = 'url(images/background.jpg)';
    //localStorage.clear();
  }

  handleLogin = () => {
    let that = this;
    const { email, password } = that.state;
    axios.post(api + '/login', {
      email, password
    })
    .then(function (response) {
      let user = response.data.user;
      that.props.onLogin(user);
    })
    .catch(function (error) {
      let code = error.response.data.error;
      if (code == 'Correo Electronico y Contraseña son requeridas') {
        that.setState({
          errorEmail: true,
          errorPassword: true,
          errorMessage: code
        });
      }else if (code == 'Correo Electronico y Contraseña no coinciden') {
        that.setState({
          errorEmail: false,
          errorPassword: true,
          errorMessage: code
        });
      }else if (code == 'Correo Electronico no encontrado') {
        that.setState({
          errorEmail: true,
          errorPassword: false,
          errorMessage: code
        });
      }
    });
  }

  setEmail = (event) => {
    this.setState({ email: event.target.value });
  }

  setPassword = (event) => {
    this.setState({ password: event.target.value });
  }

  showError = () => {
    if (this.state.errorMessage != '') {
      return (
        <div style={{ marginBottom: '8px' }}>
          <Message>
            {this.state.errorMessage}
          </Message>
        </div>
      );
    }
    return null;
  }

  render() {
    return (
      <Grid
        textAlign='center'
        style={{height: '100%'}}
        verticalAlign='middle'
      >
        <Grid.Column style={{ maxWidth: 450 }}>
          <Image src='images/logo.png' centered style={{ height: '60%', width: '60%', marginTop: '10%' }} />
          <Header as='h3' textAlign='center' style={{color: '#fff'}}>
            Banco Municipal de Sangre del Distrito Capital
          </Header>
          <Form size='large'>
            <Segment stacked>
              <Form.Input
                fluid
                icon='at'
                iconPosition='left'
                placeholder='Correo Electronico'
                onChange={ this.setEmail }
                error={this.state.errorEmail}
              />
              <Form.Input
                fluid
                icon='lock'
                iconPosition='left'
                placeholder='Contraseña'
                type='password'
                onChange={ this.setPassword }
                error={this.state.errorPassword}
              />
              { this.showError() }
              <Button
                color='teal'
                fluid size='large'
                onClick={this.handleLogin}>
                Iniciar Sesión
              </Button>
            </Segment>
          </Form>
          <Message>
            <Button
              color='blue'
              fluid size='large'
              onClick={this.goSignUp}>
              ¿No tienes cuenta? Registrate
            </Button>
          </Message>
        </Grid.Column>
      </Grid>
    );
  }
}

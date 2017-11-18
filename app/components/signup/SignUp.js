import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios'
import { Button, Form, Grid, Header, Image, Input, Message, Segment } from 'semantic-ui-react';
import { api } from '../../firebase/constants';

export default class SignUp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      nombre: '',
      apellido: '',
      cedula: '',
      telefono: '',
      errorMessage: ''
    };
  }

  static propTypes = {
    onLogin: PropTypes.func.isRequired,
    goLogin: PropTypes.func.isRequired
  };

  componentWillMount() {
    document.body.style.background = 'url(images/background.jpg)';
    // console.log(this.props.user);
    //localStorage.clear();
  }

  goLogin = () => {
    this.props.goLogin();
  }

  handleSignUp = () => {
    let that = this;
    const { email, password, nombre, apellido, cedula, telefono } = that.state;
    axios.post(api + '/personal', {
      email, password, nombre, apellido, cedula, telefono
    })
    .then(function (response) {
      let user = response.data.user;
      that.props.onLogin(user);
    })
    .catch(function (error) {
      let code = error.response.data.err.invalidAttributes;
      if (code.nombre) {
        that.setState({
          errorNombre: true, errorApellido: false, errorCedula: false, errorEmail: false, errorPassword: false,
          errorMessage: 'Nombre es requerido' });
      }
      else if (code.apellido) {
        that.setState({
          errorNombre: false, errorApellido: true, errorCedula: false, errorEmail: false, errorPassword: false,
          errorMessage: 'Apellido es requerido' });
      }
      else if (code.cedula) {
        if (code.cedula[0].rule == 'unique') {
          that.setState({
            errorNombre: false, errorApellido: false, errorCedula: true, errorEmail: false, errorPassword: false,
            errorMessage: 'Cedula ya se encuentra registrada' });
        }else {
          that.setState({
            errorNombre: false, errorApellido: false, errorCedula: true, errorEmail: false, errorPassword: false,
            errorMessage: 'Cedula es requerida y solo números' });
        }
      }
      else if (code.email) {
        if (code.email[0].rule == 'unique') {
          that.setState({
            errorNombre: false, errorApellido: false, errorCedula: false, errorEmail: true, errorPassword: false,
            errorMessage: 'Correo Electronico ya registrado' });
        }else{
          that.setState({
            errorNombre: false, errorApellido: false, errorCedula: false, errorEmail: true, errorPassword: false,
            errorMessage: 'Correo Electronico es requerido' });
        }
      }
      else if (code.password) {
        that.setState({
          errorNombre: false, errorApellido: false, errorCedula: false, errorEmail: false, errorPassword: true,
          errorMessage: 'Contraseña es requerido'
        });
      }
    });
  }

  handleChange = (e, { name }) => this.setState({ [name]: e.target.value })

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
        style={{ height: '100%' }}
        verticalAlign='middle'
      >
        <Grid.Column style={{ maxWidth: 450 }}>
          <Image src='images/logo.png' centered style={{ height: '60%', width: '60%', marginTop: '10%' }} />
          <Header as='h3' textAlign='center' style={{color: '#fff'}}>
            Registrar nueva cuenta
          </Header>
          <Form size='large'>
            <Segment stacked>
              <Form.Input
                fluid
                icon='user'
                iconPosition='left'
                name='nombre'
                placeholder='Nombres'
                onChange={ this.handleChange }
                error={this.state.errorNombre}
              />
              <Form.Input
                fluid
                icon='user'
                iconPosition='left'
                name='apellido'
                placeholder='Apellidos'
                onChange={ this.handleChange }
                error={this.state.errorApellido}
              />
              <Form.Input
                fluid
                icon='address card'
                iconPosition='left'
                name='cedula'
                placeholder='Cédula de Identidad'
                onChange={ this.handleChange }
                error={this.state.errorCedula}
              />
              <Form.Input
                fluid
                icon='phone'
                iconPosition='left'
                name='telefono'
                placeholder='Telefono'
                onChange={ this.handleChange }
              />
              <Form.Input
                fluid
                icon='at'
                iconPosition='left'
                name='email'
                placeholder='Correo Electronico'
                onChange={ this.handleChange }
                error={this.state.errorEmail}
              />
              <Form.Input
                fluid
                icon='lock'
                iconPosition='left'
                name='password'
                placeholder='Contraseña'
                type='password'
                onChange={ this.handleChange }
                error={this.state.errorPassword}
              />
              { this.showError() }
              <Button
                color='teal'
                fluid size='large'
                onClick={this.handleSignUp}>
                Registrarse
              </Button>
            </Segment>
          </Form>
          <Message>
            <Button
              color='blue'
              fluid size='large'
              onClick={this.goLogin}>
              ¿Tienes ya una cuenta? Inicie Sesión
            </Button>
          </Message>
        </Grid.Column>
      </Grid>
    );
  }
}

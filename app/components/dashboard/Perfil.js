import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios'
import { Button, Form, Grid, Header, Image, Input, Message, Segment, Icon } from 'semantic-ui-react';
import { api } from '../../firebase/constants';

export default class Perfil extends Component {
  constructor(props) {
    super(props);
    let { email, nombre, apellido, cedula, telefono, id } = props.user;
    this.state = {
      id,
      email,
      password: '',
      nombre,
      apellido,
      cedula,
      telefono,
      errorMessage: ''
    };
  }

  static propTypes = {
    save: PropTypes.func.isRequired,
    logOut: PropTypes.func.isRequired
  };

  signOut = () => {
    this.props.logOut();
  }

  handleUpdate = () => {
    let that = this;
    const { email, password, nombre, apellido, cedula, telefono, id } = that.state;
    axios.put(api + '/personal/' + id, {
        email, password, nombre, apellido, cedula, telefono
    })
    .then(function (response) {
      let user = response.data.user;
      that.props.save(user);
    })
    .catch(function (error) {
      console.log(error);
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
    let { email, nombre, apellido, cedula, telefono, password } = this.state;
    return (
      <Grid
        textAlign='center'
        style={{ height: '100%' }}
        verticalAlign='middle'
      >
        <Grid.Column style={{ maxWidth: 450 }}>
          <Form size='large'>
            <h2 style={{margin: '5%', color: '#fff'}}>Actualizar Perfil</h2>
            <Segment stacked>
              <Form.Input
                fluid
                icon='user'
                iconPosition='left'
                name='nombre'
                value={nombre}
                placeholder='Nombres'
                onChange={ this.handleChange }
                error={this.state.errorNombre}
              />
              <Form.Input
                fluid
                icon='user'
                iconPosition='left'
                name='apellido'
                value={apellido}
                placeholder='Apellidos'
                onChange={ this.handleChange }
                error={this.state.errorApellido}
              />
              <Form.Input
                fluid
                icon='address card'
                iconPosition='left'
                name='cedula'
                value={cedula}
                placeholder='Cédula de Identidad'
                onChange={ this.handleChange }
                error={this.state.errorCedula}
              />
              <Form.Input
                fluid
                icon='phone'
                iconPosition='left'
                name='telefono'
                value={telefono}
                placeholder='Telefono'
                onChange={ this.handleChange }
              />
              <Form.Input
                fluid
                icon='at'
                iconPosition='left'
                name='email'
                value={email}
                placeholder='Correo Electronico'
                onChange={ this.handleChange }
                error={this.state.errorEmail}
              />
              <Form.Input
                fluid
                icon='lock'
                iconPosition='left'
                name='password'
                value={password}
                placeholder='Contraseña'
                type='password'
                onChange={ this.handleChange }
                error={this.state.errorPassword}
              />
              { this.showError() }
              <Button
                color='teal'
                fluid size='large'
                onClick={this.handleUpdate}>
                Actualizar
              </Button>
            </Segment>
            <Button
              color='google plus'
              fluid size='large'
              onClick={this.signOut}>
              Cerrar Sesión
            </Button>
          </Form>
        </Grid.Column>
      </Grid>
    );
  }
}

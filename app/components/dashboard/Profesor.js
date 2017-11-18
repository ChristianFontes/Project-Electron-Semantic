import React, { Component } from 'react'
import { Form, Message, Table } from 'semantic-ui-react'
import { api } from '../../firebase/constants';
import axios from 'axios'

export default class Profesor extends Component {
  constructor(props) {
    super(props)
    this.state = {
      email: '',
      password: '',
      nombre: '',
      apellido: '',
      cedula: '',
      telefono: '',
      errorMessage: '',
      errorNombre: false,
      errorApellido: false,
      errorCedula: false,
      errorEmail: false,
      dataListStudent: [],
      buttonEdit: false,
      id: null
    }
  }

  componentDidMount() {
    this.getListProfesores();
  }

  getListProfesores = () => {
    let that = this;
    axios.get(api + '/profesor', {
      params: {
        sort: 'id DESC'
      }
    })
    .then(function (response) {
      let data = response.data;
      if (data.length > 0) {
        that.setState({
          dataListProfesor: data
        });
      }
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  profesorEdit = (data) => {
    const { email, nombre, apellido, cedula, telefono, id } = data;
    this.setState({
      id, email, nombre, apellido, cedula, telefono, buttonEdit: true
    });
  }

  renderListProfesores = () => {
    let { dataListProfesor } = this.state;
    if (dataListProfesor && dataListProfesor.length > 0) {
      var indents = [];
      for (var i = 0; i < dataListProfesor.length; i++) {
        let data = dataListProfesor[i];
        indents.push(
          <Table.Row key={i}>
            <Table.Cell>{dataListProfesor[i].cedula}</Table.Cell>
            <Table.Cell>{dataListProfesor[i].apellido}</Table.Cell>
            <Table.Cell>{dataListProfesor[i].nombre}</Table.Cell>
            <Table.Cell>{dataListProfesor[i].email}</Table.Cell>
            <Table.Cell>{dataListProfesor[i].telefono}</Table.Cell>
            <Table.Cell><Form.Button color='blue' onClick={() => this.profesorEdit(data)}>Editar</Form.Button></Table.Cell>
            <Table.Cell><Form.Button color='red' onClick={() => this.deleteProfesor(data)}>Eliminar</Form.Button></Table.Cell>
          </Table.Row>
        );
      }
      return (
        <div>
        <h3 style={{margin: '3%', color: '#fff'}}>Listado de Profesores</h3>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Cédula</Table.HeaderCell>
              <Table.HeaderCell>Apellidos</Table.HeaderCell>
              <Table.HeaderCell>Nombres</Table.HeaderCell>
              <Table.HeaderCell>Email</Table.HeaderCell>
              <Table.HeaderCell>Telefono</Table.HeaderCell>
              <Table.HeaderCell>Editar</Table.HeaderCell>
              <Table.HeaderCell>Eliminar</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
          {
            indents
          }
          </Table.Body>
        </Table>
        </div>
      )
    }
  }

  handleChange = (e, { name }) => this.setState({ [name]: e.target.value })

  removeFields = () => {
    this.setState({
      email: '',
      password: '',
      nombre: '',
      apellido: '',
      cedula: '',
      telefono: '',
      errorMessage: '',
      errorNombre: false,
      errorApellido: false,
      errorCedula: false,
      errorEmail: false,
      buttonEdit: false
    });
  }

  updateProfesor = () => {
    let that = this;
    const { email, nombre, apellido, cedula, telefono, id } = that.state;
    axios.put(api + '/profesor/' + id, {
      nombre, apellido, cedula, email, telefono
    }).then(function (response) {
      that.getListProfesores();
      that.removeFields();
    }).catch(function (error) {
      console.log(error);
    })
  }

  deleteProfesor = (data) => {
    let that = this;
    const { id } = data;
    axios.delete(api + '/profesor/', {
        params: {
          id: id
        }
    }).then(function (response) {
      that.getListProfesores();
      that.removeFields();
    }).catch(function (error) {
      console.log(error);
    })
  }

  sendProfesor = () => {
    let that = this;
    const { email, nombre, apellido, cedula, telefono } = that.state;
    axios.post(api + '/profesor', {
      nombre, apellido, cedula, email, telefono
    }).then(function (response) {
      that.getListProfesores();
      that.removeFields();
    }).catch(function (error) {
      if (error.response.data.invalidAttributes) {
        let code = error.response.data.invalidAttributes;
        if (code.nombre) {
          that.setState({
            errorNombre: true, errorApellido: false, errorCedula: false, errorEmail: false,
            errorMessage: 'Nombres son requeridos' });
        }
        else if (code.apellido) {
          that.setState({
            errorNombre: false, errorApellido: true, errorCedula: false, errorEmail: false,
            errorMessage: 'Apellidos son requeridos' });
        }
        else if (code.cedula) {
          if (code.cedula[0].rule == 'unique') {
            that.setState({
              errorNombre: false, errorApellido: false, errorCedula: true, errorEmail: false,
              errorMessage: 'Cedula ya se encuentra registrada' });
          }else {
            that.setState({
              errorNombre: false, errorApellido: false, errorCedula: true, errorEmail: false,
              errorMessage: 'Cedula es requerida e ingrese solo números' });
          }
        }
        else if (code.email) {
          if (code.email[0].rule == 'unique') {
            that.setState({
              errorNombre: false, errorApellido: false, errorCedula: false, errorEmail: true,
              errorMessage: 'Correo Electronico ya registrado' });
          }else{
            that.setState({
              errorNombre: false, errorApellido: false, errorCedula: false, errorEmail: true,
              errorMessage: 'Correo Electronico es requerido' });
          }
        }
      }else if (error.response.data.name == 'Error') {
        var str = error.response.data.message;
        if (str.search("cedula") > 0) {
          that.setState({
            errorNombre: false, errorApellido: false, errorCedula: true, errorEmail: false,
            errorMessage: 'Cédula ya registrada'
          });
        }
        if (str.search("email") > 0) {
          that.setState({
            errorNombre: false, errorApellido: false, errorCedula: false, errorEmail: true,
            errorMessage: 'Correo Electronico ya registrado'
          });
        }
      }
    });
  }

  showError = () => {
    if (this.state.errorMessage != '') {
      return (
        <div style={{ marginBottom: '8px' }}>
          <Message negative>
            {this.state.errorMessage}
          </Message>
        </div>
      );
    }
    return null;
  }

  renderButtones = () => {
    let { buttonEdit } = this.state;
    if (!buttonEdit) {
      return (
        <Form.Group inline>
          <Form.Button color='teal' onClick={this.sendProfesor}>Registrar Profesor</Form.Button>
          <Form.Button color='grey' onClick={this.removeFields}>Limpiar campos</Form.Button>
        </Form.Group>
      )
    }else {
      return (
        <Form.Group inline>
          <Form.Button color='blue' onClick={this.updateProfesor}>Actualizar Profesor</Form.Button>
          <Form.Button color='grey' onClick={this.removeFields}>Limpiar campos</Form.Button>
        </Form.Group>
      )
    }
  }

  render() {
    const { email, nombre, apellido, cedula, telefono } = this.state;
    return (
      <Form style={{margin: '8%'}} inverted>
        <h2 style={{margin: '5%', color: '#fff'}}>Registrar Profesor</h2>
        { this.showError() }
        <Form.Group widths='equal'>
          <Form.Input fluid icon='user' iconPosition='left' name='nombre' placeholder='Nombres' value={nombre}
            onChange={ this.handleChange } error={this.state.errorNombre} />
          <Form.Input fluid icon='user' iconPosition='left' name='apellido' placeholder='Apellidos' value={apellido}
            onChange={ this.handleChange } error={this.state.errorApellido}
          />
          <Form.Input fluid icon='address card' iconPosition='left' name='cedula' placeholder='Cédula de Identidad' value={cedula}
            onChange={ this.handleChange } error={this.state.errorCedula}
          />
        </Form.Group>
        <Form.Group widths='equal'>
          <Form.Input fluid icon='phone' iconPosition='left' name='telefono' placeholder='Telefono' value={telefono}
            onChange={ this.handleChange }
          />
          <Form.Input fluid icon='at' iconPosition='left' name='email' placeholder='Correo Electronico' value={email}
            onChange={ this.handleChange } error={this.state.errorEmail}
          />
        </Form.Group>
        { this.renderButtones() }
        { this.renderListProfesores() }
      </Form>
    )
  }
}

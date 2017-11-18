import React, { Component } from 'react'
import { Form, Message, Dropdown, Input, Table } from 'semantic-ui-react'
import { api } from '../../firebase/constants';
import axios from 'axios'
import moment from 'moment'

export default class Actividad extends Component {
  constructor(props) {
    super(props)
    this.state = {
      errorNombre: false,
      errorProfesor: false,
      errorMessage: '',
      nombre: '',
      data: null,
      dataActividades: [],
      value: '',
      vacantes: 0,
      fecha: '',
      isFetching: true,
      textDropdown: 'Seleccione el profesor para la actividad',
      buttonEdit: false,
      id: null
    }
  }

  componentDidMount() {
    this.getListProfesores();
    this.getListActividades();
  }

  getListActividades = () => {
    let that = this;
    axios.get(api + '/actividad')
    .then(function (response) {
      let data = response.data;
      if (data.length > 0) {
        that.setState({
          dataActividades: response.data
        });
      }
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  actividadEdit = (data) => {
    const { nombre, vacantes, fecha, id } = data;
    let profesorId = data.profesor.length > 0 ? data.profesor[0].id : null;
    this.setState({
      nombre, vacantes, fecha, value: profesorId, buttonEdit: true, id
    });
  }

  actividadDelete = (data) => {
    let that = this;
    const { id } = data;
    axios.delete(api + '/actividad/', {
        params: {
          id: id
        }
    }).then(function (response) {
      that.getListActividades();
      that.removeFields();
    }).catch(function (error) {
      console.log(error);
    })
  }

  renderListActividades = () => {
    let { dataActividades } = this.state;
    if (dataActividades.length > 0) {
      var indents = [];
      for (var i = 0; i < dataActividades.length; i++) {
        let data = dataActividades[i];
        indents.push(
          <Table.Row key={i}>
            <Table.Cell>{dataActividades[i].nombre}</Table.Cell>
            <Table.Cell>{dataActividades[i].vacantes}</Table.Cell>
            <Table.Cell>{dataActividades[i].profesor.length > 0 ? dataActividades[i].profesor[0].apellido : null}</Table.Cell>
            <Table.Cell>{dataActividades[i].profesor.length > 0 ? dataActividades[i].profesor[0].nombre : null}</Table.Cell>
            <Table.Cell>{dataActividades[i].fecha}</Table.Cell>
            <Table.Cell><Form.Button color='blue' onClick={() => this.actividadEdit(data)}>Editar</Form.Button></Table.Cell>
            <Table.Cell><Form.Button color='red' onClick={() => this.actividadDelete(data)}>Eliminar</Form.Button></Table.Cell>
          </Table.Row>
        );
      }
      return (
        <div>
        <h3 style={{margin: '3%', color: '#fff'}}>Listado de Actividades</h3>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Nombre de la Actividad</Table.HeaderCell>
              <Table.HeaderCell>Vacantes</Table.HeaderCell>
              <Table.HeaderCell>Apellidos</Table.HeaderCell>
              <Table.HeaderCell>Nombres</Table.HeaderCell>
              <Table.HeaderCell>Fecha</Table.HeaderCell>
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

  getListProfesores = () => {
    let that = this;
    axios.get(api + '/profesor')
    .then(function (response) {
      let data = response.data;
      if (data.length > 0) {
        that.setState({
          data: response.data,
          isFetching: false
        });
      }else {
        that.setState({
          data: response.data,
          textDropdown: 'No hay profesores registrados'
        });
      }
    })
    .catch(function (error) {
      console.log(error);
      that.setState({
        errorProfesor: true,
        errorMessage: 'Error al cargar lista de profesores, contactar al administrador'
      });
    });
  }

  handleChangeDropdown = (e, { value }) => this.setState({ value })

  handleChange = (e, { name }) => this.setState({ [name]: e.target.value })

  showSelect = () => {
    let { data, value, isFetching, errorProfesor, textDropdown } = this.state;
    if (data) {
      let array = []
      for (var i in data) {
        if (data.hasOwnProperty(i)) {
          let nombreCompleto = data[i].nombre + ' ' + data[i].apellido;
          let obj = {
            key: data[i].id,
            value: data[i].id,
            text: nombreCompleto
          }
          array.push(obj);
        }
      }
      return (
        <Form.Field>
          <label>{textDropdown}</label>
          <Dropdown
            fluid
            selection
            options={array}
            value={value}
            placeholder={textDropdown}
            onChange={this.handleChangeDropdown}
            disabled={isFetching}
            error={errorProfesor}
          />
        </Form.Field>
      );
    }
  }

  removeFields = () => {
    this.setState({
      errorNombre: false,
      errorProfesor: false,
      errorMessage: '',
      nombre: '',
      value: '',
      vacantes: 0,
      fecha: '',
      buttonEdit: false
    });
  }

  updateActividad = () => {
    let that = this;
    const { nombre, value, vacantes, fecha, id } = that.state;
    axios.put(api + '/actividad/' + id, {
      nombre, profesor: value, vacantes, fecha
    }).then(function (response) {
      that.removeFields();
      that.getListActividades();
    }).catch(function (error) {
      let code = error.response.data.invalidAttributes;
      if (code.nombre) {
        that.setState({
          errorNombre: true,
          errorMessage: 'Nombre de la Actividad es requerida'
        });
      }else if (code.profesor) {
        that.setState({
          errorProfesor: true,
          errorMessage: 'El profesor es requerido'
        });
      }
    });
  }

  sendActividad = () => {
    let that = this;
    const { nombre, value, vacantes, fecha } = that.state;
    axios.post(api + '/actividad', {
      nombre, profesor: value, vacantes, fecha
    }).then(function (response) {
      that.removeFields();
      that.getListActividades();
    }).catch(function (error) {
      if (error.response.data.invalidAttributes) {
        let code = error.response.data.invalidAttributes;
        if (code.nombre) {
          that.setState({
            errorNombre: true,
            errorMessage: 'Nombre de la Actividad es requerida'
          });
        }else if (code.profesor) {
          that.setState({
            errorProfesor: true,
            errorMessage: 'El profesor es requerido'
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
  }

  renderButtones = () => {
    let { buttonEdit } = this.state;
    if (!buttonEdit) {
      return (
        <Form.Group inline>
          <Form.Button color='teal' onClick={this.sendActividad}>Crear Actividad</Form.Button>
          <Form.Button color='grey' onClick={this.removeFields}>Limpiar campos</Form.Button>
        </Form.Group>
      )
    }else {
      return (
        <Form.Group inline>
          <Form.Button color='blue' onClick={this.updateActividad}>Actualizar Actividad</Form.Button>
          <Form.Button color='grey' onClick={this.removeFields}>Limpiar campos</Form.Button>
        </Form.Group>
      )
    }
  }

  render() {
    const { nombre, vacantes, fecha } = this.state;
    return (
      <Form style={{margin: '4%'}} inverted>
        <h2 style={{margin: '5%', color: '#fff'}}>Crear Actividad</h2>
        { this.showError() }
        <Form.Group widths='equal'>
          <Form.Input name='nombre' value={nombre} label='Nombre de la Actividad' placeholder='Nombre de la Actividad' onChange={ this.handleChange } error={this.state.errorNombre} />
          { this.showSelect() }
        </Form.Group>
        <Form.Group inline>
          <Input
              action={{ color: 'blue', labelPosition: 'left', icon: 'users', content: 'Vacantes' }}
              actionPosition='left'
              placeholder='Número de Vacantes'
              type='number'
              name='vacantes'
              value={vacantes}
              onChange={ this.handleChange }
              error={this.state.errorVacantes}
              style={{margin: '0%'}}/>
        </Form.Group>
        <Form.Group inline>
        <Input
            action={{ color: 'blue', labelPosition: 'left', icon: 'calendar', content: 'Fecha' }}
            actionPosition='left'
            name='fecha'
            value={fecha}
            onChange={ this.handleChange }
            error={this.state.errorFecha}
            type='date'/>
        </Form.Group>
        { this.renderButtones() }
        { this.renderListActividades() }
      </Form>
    )
  }
}

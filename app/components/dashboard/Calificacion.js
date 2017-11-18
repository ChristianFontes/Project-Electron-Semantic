import React, { Component } from 'react'
import { Form, Message, Dropdown, Table } from 'semantic-ui-react'
import { api } from '../../firebase/constants';
import axios from 'axios'

export default class Calificacion extends Component {
  constructor(props) {
    super(props)
    this.state = {
      errorNombre: false,
      errorProfesor: false,
      errorActividad: false,
      errorCedula: false,
      errorMessage: '',
      cedula: '',
      data: null,
      dataActividad: null,
      dataEstudiante: null,
      value: '',
      valueActividad: '',
      valueProfesor: '',
      calificacion: '',
      isFetchingProfesor: true,
      isFetchingActividad: true,
      textDropdown: 'Seleccione el profesor o tutor de la actividad',
      textDropdownActividad: 'Seleccione la actividad'
    }
  }

  componentDidMount() {
    this.fetchProfesor();
    this.fetchActividad();
  }

  searchEstudiante = () => {
    let { cedula } = this.state;
    let that = this;
    if (cedula) {
      axios.get(api + '/estudiante', {
        params: {
          cedula: cedula
        }
      })
      .then(function (response) {
        let dataEstudiante = response.data;
        if (dataEstudiante.length == 1) {
          that.setState({
            dataEstudiante,
            errorMessage: '',
            errorCedula: false
          });
        }else if (dataEstudiante.length == 0) {
          that.setState({
            dataEstudiante: null,
            errorMessage: 'Número de cédula no existe',
            errorCedula: true
          });
        }
      })
      .catch(function (error) {
        console.log(error);
      });
    }
  }

  fetchActividad = () => {
    let that = this;
    axios.get(api + '/actividad')
    .then(function (response) {
      let data = response.data;
      if (data.length > 0) {
        that.setState({
          dataActividad: response.data,
          isFetchingActividad: false
        });
      }else {
        that.setState({
          dataActividad: response.data,
          textDropdownActividad: 'No hay actividades registradas'
        });
      }
    })
    .catch(function (error) {
      that.setState({
        errorActividad: true,
        errorMessage: 'Error al cargar lista de actividades, contactar al administrador'
      });
    });
  }

  fetchProfesor = () => {
    let that = this;
    axios.get(api + '/profesor')
    .then(function (response) {
      let data = response.data;
      if (data.length > 0) {
        that.setState({
          data: response.data,
          isFetchingProfesor: false
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

  handleChangeDropdown = (e, { value }) => { this.setState({ valueProfesor: value }) }

  handleChangeDropdownActividad = (e, { value }) => this.setState({ valueActividad: value })

  handleChangeRadio = (e, { value }) => this.setState({ value })

  handleChange = (e, { name }) => this.setState({ [name]: e.target.value })

  showSelectProfesor = () => {
    let { data, valueProfesor, isFetchingProfesor, errorProfesor, textDropdown } = this.state;
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
            value={valueProfesor}
            placeholder={textDropdown}
            onChange={this.handleChangeDropdown}
            disabled={isFetchingProfesor}
            error={errorProfesor}
          />
        </Form.Field>
      );
    }
  }

  showSelectActividad = () => {
    let { dataActividad, valueActividad, isFetchingActividad, errorActividad, textDropdownActividad } = this.state;
    if (dataActividad) {
      let array = []
      for (var i in dataActividad) {
        if (dataActividad.hasOwnProperty(i)) {
          let nombreCompleto = dataActividad[i].nombre;
          let obj = {
            key: dataActividad[i].id,
            value: dataActividad[i].id,
            text: nombreCompleto
          }
          array.push(obj);
        }
      }
      return (
        <Form.Field>
          <label>{textDropdownActividad}</label>
          <Dropdown
            fluid
            selection
            options={array}
            value={valueActividad}
            placeholder={textDropdownActividad}
            onChange={this.handleChangeDropdownActividad}
            disabled={isFetchingActividad}
            error={errorActividad}
          />
        </Form.Field>
      );
    }
  }

  removeFields = () => {
    this.setState({
      errorNombre: false,
      errorProfesor: false,
      errorActividad: false,
      errorCedula: false,
      errorCalificacion: false,
      errorMessage: '',
      cedula: '',
      dataEstudiante: null,
      value: '',
      calificacion: ''
    });
  }

  loadCalificacion = () => {
    let that = this;
    const { valueActividad, valueProfesor, dataEstudiante, value, calificacion } = that.state;
    axios.post(api + '/updateOrCreate', {
      actividadId: valueActividad,
      profesorId: valueProfesor,
      estudianteId: dataEstudiante[0].id,
      referencia: value,
      calificacion
    }).then(function (response) {
      that.removeFields();
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
    }else if (this.state.calificacion > 20 || this.state.calificacion < 0) {
      return (
        <div style={{ marginBottom: '8px' }}>
          <Message negative>
            La calificación debe ser entre 0 y 20
          </Message>
        </div>
      );
    }
  }

  renderDataStudent = () => {
    let { dataEstudiante } = this.state;
    if (dataEstudiante) {
      return (
        <div>
          <h3 style={{margin: '3%', color: '#fff'}}>Datos del Estudiante</h3>
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Cédula</Table.HeaderCell>
                <Table.HeaderCell>Nombres</Table.HeaderCell>
                <Table.HeaderCell>Apellidos</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <Table.Row>
                <Table.Cell>{dataEstudiante[0].cedula}</Table.Cell>
                <Table.Cell>{dataEstudiante[0].nombre}</Table.Cell>
                <Table.Cell>{dataEstudiante[0].apellido}</Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
        </div>
      )
    }
  }

  renderLoadCalificacion = () => {
    const { valueActividad, valueProfesor, dataEstudiante, value, calificacion } = this.state;
    if (valueActividad != '' && value != '' && valueProfesor != '' && calificacion != '' && dataEstudiante != null) {
      if (calificacion >= 0 && calificacion <= 20) {
        return (
          <Form.Group inline>
            <Form.Button color='teal' onClick={this.loadCalificacion}>Cargar Calificacion</Form.Button>
            <Form.Button color='grey' onClick={this.removeFields}>Borrar</Form.Button>
          </Form.Group>
        )
      }
    }
  }

  render() {
    const { nombre, cedula, value, calificacion } = this.state;
    return (
      <Form style={{margin: '5%'}} inverted>
        <h2 style={{margin: '5%', color: '#fff'}}>Cargar Calificaciones</h2>
        { this.showError() }
        <Form.Group inline>
          <Form.Input label='Número Cédula' placeholder='Número Cédula' name='cedula' value={cedula} onChange={ this.handleChange } error={this.state.errorCedula}/>
          <Form.Button color='blue' onClick={this.searchEstudiante}>Buscar Estudiante</Form.Button>
        </Form.Group>
        { this.renderDataStudent() }
        <h3 style={{margin: '3%', color: '#fff'}}>Seleccione Profesor o Tutor y Actividad</h3>
        <Form.Group widths='equal'>
          { this.showSelectProfesor() }
          { this.showSelectActividad() }
        </Form.Group>
        <Form.Group inline>
          <label>Tipo de Calificación:</label>
          <Form.Radio label='Prueba de Admision' value='Admision' checked={value === 'Admision'} onChange={this.handleChangeRadio} />
          <Form.Radio label='Parcial I' value='Parcial I' checked={value === 'Parcial I'} onChange={this.handleChangeRadio} />
          <Form.Radio label='Parcial II' value='Parcial II' checked={value === 'Parcial II'} onChange={this.handleChangeRadio} />
          <Form.Radio label='Parcial III' value='Parcial III' checked={value === 'Parcial III'} onChange={this.handleChangeRadio} />
          <Form.Radio label='Final' value='Final' checked={value === 'Final'} onChange={this.handleChangeRadio} />
          <Form.Radio label='Reparación' value='Reparación' checked={value === 'Reparación'} onChange={this.handleChangeRadio} />
        </Form.Group>
        <Form.Group inline>
          <Form.Input label='Calificación:' placeholder='Calificación' name='calificacion' value={calificacion} onChange={ this.handleChange } error={this.state.errorCalificacion}/>
        </Form.Group>
        { this.renderLoadCalificacion() }
      </Form>
    )
  }
}

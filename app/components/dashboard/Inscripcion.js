import React, { Component } from 'react'
import { Form, Table, Message, Dropdown } from 'semantic-ui-react'
import { api } from '../../firebase/constants';
import axios from 'axios'

export default class Inscripcion extends Component {
  constructor(props) {
    super(props)
    this.state = {
      tituloCheck: false,
      notasCheck: false,
      cedulaCheck: false,
      cedula: '',
      data: null,
      inscripcion: [],
      dataListInscripciones: [],
      value: '',
      isFetching: true,
      errorMessage: '',
      errorCedula: false,
      dataActividad: null,
      valueActividad: '',
      isFetchingActividad: true,
      textDropdownActividad: 'Seleccione la actividad',
      id: null,
      buttonEdit: false
    }
  }

  componentDidMount() {
    this.fetchActividad();
    this.getListInscripcion();
  }

  getListInscripcion = () => {
    let that = this;
    axios.get(api + '/inscripcion', {
      params: {
        sort: 'id DESC',
        limit: 5
      }
    })
    .then(function (response) {
      let data = response.data;
      if (data.length > 0) {
        that.setState({
          dataListInscripciones: data
        });
      }else {
        that.setState({
          dataListInscripciones: []
        });
      }
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  renderListInscripciones = () => {
    let { dataListInscripciones } = this.state;
    if (dataListInscripciones && dataListInscripciones.length > 0) {
      var indents = [];
      for (var i = 0; i < dataListInscripciones.length; i++) {
        let data = dataListInscripciones[i];
        indents.push(
          <Table.Row key={i}>
            <Table.Cell>{data.estudianteId.cedula ? data.estudianteId.cedula : null}</Table.Cell>
            <Table.Cell>{data.estudianteId.apellido ? data.estudianteId.apellido : null}</Table.Cell>
            <Table.Cell>{data.estudianteId.nombre ? data.estudianteId.nombre : null}</Table.Cell>
            <Table.Cell>{data.actividadId.nombre ? data.actividadId.nombre : null}</Table.Cell>
            <Table.Cell>{data.actividadId.fecha ? data.actividadId.fecha : null}</Table.Cell>
            <Table.Cell>{data.turno ? data.turno : null}</Table.Cell>
          </Table.Row>
        );
      }
      return (
        <div>
        <h3 style={{margin: '3%', color: '#fff'}}>Listado de las 10 últimas Inscripciones</h3>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Cédula</Table.HeaderCell>
              <Table.HeaderCell>Apellidos</Table.HeaderCell>
              <Table.HeaderCell>Nombres</Table.HeaderCell>
              <Table.HeaderCell>Nombre de la Actividad</Table.HeaderCell>
              <Table.HeaderCell>Fecha</Table.HeaderCell>
              <Table.HeaderCell>Turno</Table.HeaderCell>
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

  removeFields = () => {
    this.setState({
      tituloCheck: false,
      notasCheck: false,
      cedulaCheck: false,
      cedula: '',
      data: null,
      inscripcion: [],
      value: '',
      isFetching: true,
      errorMessage: '',
      errorCedula: false,
      valueActividad: '',
      isFetchingActividad: false,
      textDropdownActividad: 'Seleccione la actividad',
      buttonEdit: false
    });
  }

  toggle = (e, { name }) => this.setState({ [name]: !this.state[name] })

  handleChangeRadio = (e, { value }) => this.setState({ value })

  handleChange = (e, { name }) => this.setState({ [name]: e.target.value })

  handleChangeDropdown = (e, { value }) => this.setState({ valueActividad: value })

  sendInscripcion = () => {
    let that = this;
    const { data, valueActividad, tituloCheck, notasCheck, cedulaCheck, value } = that.state;
    axios.post(api + '/inscripcion', {
      estudianteId: data.id, actividadId: valueActividad, turno: value
    }).then(function (response) {
      that.removeFields();
      that.getListInscripcion();
      if (tituloCheck || notasCheck ||cedulaCheck) {
        let id = data.recaudos[0].id;
        axios.put(api + '/recaudo/' + id, {
          tituloOriginal: tituloCheck, cedulaCopia: cedulaCheck, notasCertificadas: notasCheck
        }).then(function (response) {
          that.removeFields();
          that.getListInscripcion();
        }).catch(function (error) {
          console.log(error);
        });
      }
    }).catch(function (error) {
      console.log(error.response);
      if (error.response.data.name == 'Error') {
        that.setState({
          errorCedula: true,
          errorMessage: 'Ya posee una inscripcion activa'
        });
      }
    })
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
      console.log(error);
      that.setState({
        errorActividad: true,
        errorMessage: 'Error al cargar lista de actividades, contactar al administrador'
      });
    });
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
          <Dropdown
            fluid
            selection
            options={array}
            value={valueActividad}
            placeholder={textDropdownActividad}
            onChange={this.handleChangeDropdown}
            disabled={isFetchingActividad}
            error={errorActividad}
            style={{width: '200%'}}
          />
        </Form.Field>
      );
    }
  }

  searchEstudiante = () => {
    let { cedula } = this.state;
    let that = this;
    if (cedula) {
      axios.post(api + '/findEstudiante', {
          cedula: cedula
      })
      .then(function (response) {
        let data = response.data.user;
        if (data.id) {
          axios.get(api + '/inscripcion', {
              params: {
                estudianteId: data.id
              }
          }).then(function (response) {
            let inscripcion = response.data;
            if (inscripcion.length > 0) {
              that.setState({
                data,
                inscripcion: inscripcion[0],
                errorMessage: '',
                errorCedula: false
              });
            }else {
              that.setState({
                data,
                inscripcion: [],
                errorMessage: '',
                errorCedula: false
              });
            }
          }).catch(function (error) {
            console.log(error);
          });
        }else if (data == 'Cedula no se encuentra registrada') {
          that.setState({
            data: null,
            errorMessage: "Cedula no se encuentra registrada",
            errorCedula: true
          });
        }
      })
      .catch(function (error) {
        console.log(error);
      });
    }
  }

  showError = () => {
    let { data } = this.state;
    if (this.state.errorMessage != '') {
      return (
        <div style={{ marginBottom: '8px' }}>
          <Message negative>
            {this.state.errorMessage}
          </Message>
        </div>
      );
    }else if (data) {
      let calificacion = data.calificaciones.length;
      if (calificacion == 0) {
        return (
          <div style={{ marginBottom: '8px' }}>
            <Message negative>
              No ha presentado la Prueba de Admision
            </Message>
          </div>
        );
      }else if (data.calificaciones[0].calificacion < 10) {
        return (
          <div style={{ marginBottom: '8px' }}>
            <Message negative>
              No ha aprobado la Prueba de Admisión
            </Message>
          </div>
        );
      }
    }
  }

  renderDataStudent = () => {
    let { data, inscripcion } = this.state;
    if (data) {
      let calificacion = data.calificaciones.length;
      if (calificacion > 0) {
        return (
          <div>
          <h3 style={{margin: '3%', color: '#fff'}}>Datos del Estudiante</h3>
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Cédula</Table.HeaderCell>
                <Table.HeaderCell>Nombres</Table.HeaderCell>
                <Table.HeaderCell>Apellidos</Table.HeaderCell>
                <Table.HeaderCell>Prueba Admisión</Table.HeaderCell>
                <Table.HeaderCell>Inscrito</Table.HeaderCell>
                <Table.HeaderCell>{inscripcion.actividadId ? 'Editar Inscripción' : null}</Table.HeaderCell>
                <Table.HeaderCell>{inscripcion.actividadId ? 'Eliminar Inscripción' : null}</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <Table.Row>
                <Table.Cell>{data.cedula}</Table.Cell>
                <Table.Cell>{data.nombre}</Table.Cell>
                <Table.Cell>{data.apellido}</Table.Cell>
                <Table.Cell>{data.calificaciones[0].calificacion}</Table.Cell>
                <Table.Cell>{inscripcion.actividadId ? inscripcion.actividadId.nombre : 'No está inscrito'}</Table.Cell>
                <Table.Cell>{inscripcion.actividadId ? <Form.Button color='blue' onClick={() => this.updateInscripcion(inscripcion)}>Actualizar</Form.Button> : null}</Table.Cell>
                <Table.Cell>{inscripcion.actividadId ? <Form.Button color='red' onClick={this.removeInscripcion}>Eliminar</Form.Button> : null}</Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
          </div>
        )
      }
    }
  }

  renderButtonSend = () => {
    let { buttonEdit, data, valueActividad, value } = this.state;
    if (!buttonEdit && data && valueActividad && value) {
      return (
        <Form.Group inline>
          <Form.Button color='teal' onClick={this.sendInscripcion}>Crear Inscripción</Form.Button>
          <Form.Button color='grey' onClick={this.removeFields}>Limpiar campos</Form.Button>
        </Form.Group>
      )
    }else if (buttonEdit && data && valueActividad && value) {
      return (
        <Form.Group inline>
          <Form.Button color='blue' onClick={this.sendUpdateInscripcion}>Actualizar Inscripción</Form.Button>
          <Form.Button color='grey' onClick={this.removeFields}>Limpiar campos</Form.Button>
        </Form.Group>
      )
    }
  }

  updateInscripcion = (data) => {
    const { turno, actividadId, id } = data;
    this.setState({
      value: turno, valueActividad: actividadId.id, id, buttonEdit: true
    });
  }

  sendUpdateInscripcion = () => {
    let that = this;
    const { valueActividad, tituloCheck, notasCheck, cedulaCheck, value, id, data } = that.state;
    axios.put(api + '/inscripcion/' + id, {
      actividadId: valueActividad, turno: value
    }).then(function (response) {
      that.removeFields();
      that.getListInscripcion();
      if (tituloCheck || notasCheck ||cedulaCheck) {
        if (data && data.recaudos[0].length > 0) {
          let id = data.recaudos[0].id;
          axios.put(api + '/recaudo/' + id, {
            tituloOriginal: tituloCheck, cedulaCopia: cedulaCheck, notasCertificadas: notasCheck
          }).then(function (response) {
            that.removeFields();
            that.getListInscripcion();
          }).catch(function (error) {
            console.log(error);
          });
        }
      }
    }).catch(function (error) {
      console.log(error.response);
      if (error.response.data.name == 'Error') {
        that.setState({
          errorCedula: true,
          errorMessage: 'Ya posee una inscripcion activa'
        });
      }
    })
  }

  removeInscripcion = () => {
    let { inscripcion } = this.state;
    let that = this;
    if (inscripcion) {
      axios.delete(api + '/inscripcion', {
          params: {
            id: inscripcion.id
          }
      }).then(function (response) {
        let data = response.data;
        if (data.id) {
          that.removeFields();
          that.getListInscripcion();
          that.searchEstudiante();
        }
      }).catch(function (error) {
        console.log(error);
      });
    }
  }

  render() {
    const { tituloCheck, notasCheck, cedulaCheck, value, cedula, textDropdownActividad, data } = this.state;
    return (
      <Form style={{margin: '5%'}} inverted>
        <h2 style={{margin: '5%', color: '#fff'}}>Inscripción</h2>
        { this.showError() }
        <Form.Group inline>
          <Form.Input label='Número Cédula' placeholder='Número Cédula' name='cedula' value={cedula} onChange={ this.handleChange } error={this.state.errorCedula}/>
          <Form.Button color='blue' onClick={this.searchEstudiante}>Buscar Estudiante</Form.Button>
          <label style={{marginLeft: '3%'}}>{textDropdownActividad}</label>
          { this.showSelectActividad() }
        </Form.Group>
        { this.renderDataStudent() }
        <h3 style={{margin: '3%', color: '#fff'}}>Recaudos y Turnos para la Inscripción</h3>
        <Form.Group inline>
          <label>Recaudos</label>
          <Form.Checkbox name='tituloCheck' label='Título Original' onClick={this.toggle} checked={tituloCheck}/>
          <Form.Checkbox name='notasCheck' label='Notas Certificadas' onClick={this.toggle} checked={notasCheck}/>
          <Form.Checkbox name='cedulaCheck' label='Copia Cédula' onClick={this.toggle} checked={cedulaCheck}/>
          <label style={{marginLeft: '10%'}}>Turnos</label>
          <Form.Radio label='Matutino' value='Matutino' checked={value === 'Matutino'} onChange={this.handleChangeRadio} />
          <Form.Radio label='Vespertino' value='Vespertino' checked={value === 'Vespertino'} onChange={this.handleChangeRadio} />
        </Form.Group>
        { this.renderButtonSend() }
        { this.renderListInscripciones() }
      </Form>
    )
  }
}

import React, { Component } from 'react'
import { Form, Message, Table } from 'semantic-ui-react'
import { api } from '../../firebase/constants';
import axios from 'axios'

export default class PreInscripcion extends Component {
  constructor(props) {
    super(props)
    this.state = {
      tituloCheck: false,
      cedulaCheck: false,
      errorNombre: false,
      errorApellido: false,
      errorCedula: false,
      errorEmail: false,
      buttonEdit: false,
      dataListStudent: [],
      email: '',
      nombre: '',
      apellido: '',
      cedula: '',
      telefono: '',
      errorMessage: '',
      observacion: '',
      id: null
    }
  }

  componentDidMount() {
    this.getLastPreInscripciones();
  }

  toggle = (e, { name }) => this.setState({ [name]: !this.state[name] })

  handleChange = (e, { name }) => this.setState({ [name]: e.target.value })

  getLastPreInscripciones = () => {
    let that = this;
    axios.get(api + '/estudiante', {
      params: {
        limit: 5,
        sort: 'id DESC'
      }
    })
    .then(function (response) {
      let data = response.data;
      if (data.length > 0) {
        that.setState({
          dataListStudent: data
        });
      }
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  estudianteEdit = (data) => {
    const { email, nombre, apellido, cedula, telefono, id } = data;
    let recaudo = data.recaudos[0];
    this.setState({
      id, email, nombre, apellido, cedula, telefono, buttonEdit: true,
      recaudosId: recaudo.id, tituloCheck: recaudo.cedulaCopia, cedulaCheck: recaudo.tituloCopia, observacion: recaudo.observacion
    });
  }

  renderListPreInscriptos = () => {
    let { dataListStudent } = this.state;
    if (dataListStudent.length > 0) {
      var indents = [];
      for (var i = 0; i < dataListStudent.length; i++) {
        let data = dataListStudent[i];
        indents.push(
          <Table.Row key={i}>
            <Table.Cell>{dataListStudent[i].cedula}</Table.Cell>
            <Table.Cell>{dataListStudent[i].apellido}</Table.Cell>
            <Table.Cell>{dataListStudent[i].nombre}</Table.Cell>
            <Table.Cell>{dataListStudent[i].email}</Table.Cell>
            <Table.Cell>{dataListStudent[i].telefono}</Table.Cell>
            <Table.Cell><Form.Button color='blue' onClick={() => this.estudianteEdit(data)}>Editar</Form.Button></Table.Cell>
          </Table.Row>
        );
      }
      return (
        <div>
        <h3 style={{margin: '3%', color: '#fff'}}>Listado de Estudiantes Pre-Inscritos</h3>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Cédula</Table.HeaderCell>
              <Table.HeaderCell>Apellidos</Table.HeaderCell>
              <Table.HeaderCell>Nombres</Table.HeaderCell>
              <Table.HeaderCell>Email</Table.HeaderCell>
              <Table.HeaderCell>Telefono</Table.HeaderCell>
              <Table.HeaderCell>Editar</Table.HeaderCell>
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
      cedulaCheck: false,
      errorNombre: false,
      errorApellido: false,
      errorCedula: false,
      errorEmail: false,
      buttonEdit: false,
      email: '',
      nombre: '',
      apellido: '',
      cedula: '',
      telefono: '',
      errorMessage: '',
      observacion: ''
    });
  }

  updateEstudiante = () => {
    let that = this;
    const { email, nombre, apellido, cedula, telefono, id, recaudosId, tituloCheck, cedulaCheck, observacion } = that.state;
    axios.put(api + '/estudiante/' + id, {
      nombre, apellido, cedula, email, telefono
    }).then(function (response) {
      axios.put(api + '/recaudo/' + recaudosId, {
          tituloCopia: tituloCheck, cedulaCopia: cedulaCheck, observacion
      }).then(function (response) {
        that.getLastPreInscripciones();
        that.removeFields();
      }).catch(function (error) {
        console.log(error);
      });
    }).catch(function (error) {
      if (error.response.data.name == 'Error') {
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
    })
  }

  sendPreInscripcion = () => {
    let that = this;
    const { email, nombre, apellido, cedula, telefono, observacion, tituloCheck, cedulaCheck } = that.state;
    axios.post(api + '/estudiante', {
      nombre, apellido, cedula, email, telefono
    }).then(function (response) {
      let user = response.data;
      axios.post(api + '/recaudo', {
        estudianteId: user.id, tituloCopia: tituloCheck, cedulaCopia: cedulaCheck, observacion
      }).then(function (response) {
        that.removeFields();
        that.getLastPreInscripciones();
      }).catch(function (error) {
        console.log(error);
      });
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
          <Form.Button color='teal' onClick={this.sendPreInscripcion}>Crear Pre-Inscripción</Form.Button>
          <Form.Button color='grey' onClick={this.removeFields}>Limpiar campos</Form.Button>
        </Form.Group>
      )
    }else {
      return (
        <Form.Group inline>
          <Form.Button color='blue' onClick={this.updateEstudiante}>Actualizar Estudiante</Form.Button>
          <Form.Button color='grey'onClick={this.removeFields}>Limpiar campos</Form.Button>
        </Form.Group>
      )
    }
  }

  render() {
    const { cedulaCheck, tituloCheck, email, nombre, apellido, cedula, telefono, observacion } = this.state;
    return (
      <Form style={{margin: '5%'}} inverted>
        <h2 style={{margin: '5%', color: '#fff'}}>Pre-Inscripción</h2>
        { this.showError() }
        <Form.Group widths='equal'>
          <Form.Input name='nombre' value={nombre} label='Nombres' placeholder='Nombres' onChange={ this.handleChange } error={this.state.errorNombre} />
          <Form.Input name='apellido' value={apellido} label='Apellidos' placeholder='Apellidos' onChange={ this.handleChange } error={this.state.errorApellido} />
          <Form.Input name='cedula' value={cedula} label='Número Cédula' placeholder='Número Cédula' onChange={ this.handleChange } error={this.state.errorCedula}/>
        </Form.Group>
        <Form.Group widths='equal'>
          <Form.Input name='email' value={email} label='Email' placeholder='Email' onChange={ this.handleChange } error={this.state.errorEmail}/>
          <Form.Input name='telefono' value={telefono} label='Telefono' placeholder='Télefono' onChange={ this.handleChange }/>
        </Form.Group>
        <Form.Group inline>
          <label>Recaudos</label>
          <Form.Checkbox name='tituloCheck' label='Copia Título' onChange={this.toggle} checked={tituloCheck}/>
          <Form.Checkbox name='cedulaCheck' label='Copia Cédula' onChange={this.toggle} checked={cedulaCheck}/>
        </Form.Group>
        <Form.TextArea name='observacion' value={observacion} placeholder='Información adicional...' rows="2" onChange={ this.handleChange } />
        { this.renderButtones() }
        { this.renderListPreInscriptos() }
      </Form>
    )
  }
}

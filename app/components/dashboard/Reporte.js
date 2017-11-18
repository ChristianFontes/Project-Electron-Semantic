import React, { Component } from 'react'
import { Form, Message, Dropdown, Table } from 'semantic-ui-react'
import { api } from '../../firebase/constants';
import axios from 'axios'
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

export default class Reporte extends Component {
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
      dataInscripcion: null,
      dataListStudent: [],
      value: '',
      valueActividad: '',
      valueProfesor: '',
      calificacion: '',
      isFetchingProfesor: true,
      isFetchingActividad: true,
      textDropdown: 'Seleccione el profesor de la actividad',
      textDropdownActividad: 'Seleccione la actividad'
    }
  }

  componentDidMount() {
    this.fetchActividad();
  }

  searchEstudiante = () => {
    let { cedula } = this.state;
    let that = this;
    if (cedula) {
      axios.post(api + '/findEstudianteReporte', {
          cedula: cedula
      })
      .then(function (response) {
        let dataEstudiante = response.data.user;
        let dataInscripcion = response.data.inscripcion;
        if (dataEstudiante && dataInscripcion) {
          that.setState({
            dataEstudiante,
            dataInscripcion,
            errorMessage: '',
            errorCedula: false
          });
        }else if (dataEstudiante === 'Cedula no se encuentra registrada') {
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
      console.log(error);
      that.setState({
        errorActividad: true,
        errorMessage: 'Error al cargar lista de actividades, contactar al administrador'
      });
    });
  }

  fetchInscripcion = (id) => {
    let that = this;
    axios.get(api + '/inscripcion', {
      params: {
        actividadId: id
      }
    })
    .then(function (response) {
      let data = response.data;
      if (data.length > 0) {
        that.setState({
          dataListStudent: data,
          isFetchingActividad: false
        });
      }else {
        that.setState({
          dataListStudent: [],
          isFetchingActividad: false
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

  handleChangeDropdownActividad = (e, { value }) => {
    this.setState({ valueActividad: value });
    this.fetchInscripcion(value);
  }

  handleChange = (e, { name }) => this.setState({ [name]: e.target.value })

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
            onChange={this.handleChangeDropdownActividad}
            disabled={isFetchingActividad}
            error={errorActividad}
            style={{width: 400}}
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
    let { dataEstudiante, dataInscripcion} = this.state;
    if (dataEstudiante && dataInscripcion) {
      return (
        <div>
        <h3 style={{margin: '3%', color: '#fff'}}>Datos del Estudiante</h3>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Cédula</Table.HeaderCell>
              <Table.HeaderCell>Nombres</Table.HeaderCell>
              <Table.HeaderCell>Apellidos</Table.HeaderCell>
              <Table.HeaderCell>Email</Table.HeaderCell>
              <Table.HeaderCell>Telefono</Table.HeaderCell>
              <Table.HeaderCell>Inscripción</Table.HeaderCell>
              <Table.HeaderCell>Fecha</Table.HeaderCell>
              <Table.HeaderCell>Descargar</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>{dataEstudiante.cedula}</Table.Cell>
              <Table.Cell>{dataEstudiante.nombre}</Table.Cell>
              <Table.Cell>{dataEstudiante.apellido}</Table.Cell>
              <Table.Cell>{dataEstudiante.email}</Table.Cell>
              <Table.Cell>{dataEstudiante.telefono}</Table.Cell>
              <Table.Cell>{dataInscripcion.nombre}</Table.Cell>
              <Table.Cell>{dataInscripcion.fecha}</Table.Cell>
              <Table.Cell><Form.Button onClick={this.downloadPDF}>PDF</Form.Button></Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
        </div>
      )
    }
  }

  buildTableBody(data, columns) {
      var body = [];
      body.push(['Nº Cédula', 'Apellidos', 'Nombres', 'Nombre de la Actividad', 'Turno']);
      data.forEach(function(row) {
          var dataRow = [];
          columns.forEach(function(column) {
            if (column == 'actividad') {
              let value = row.actividadId.nombre;
              dataRow.push(value.toString());
            }else if (column == 'turno') {
              let value = row[column];
              dataRow.push(value.toString());
            }else {
              let value = row.estudianteId[column];
              dataRow.push(value.toString());
            }
          })
          body.push(dataRow);
      });

      return body;
  }

  table(dataListStudent, columns) {
      return {
          style: 'table',
          table: {
              headerRows: 1,
              body: this.buildTableBody(dataListStudent, columns)
          }
      };
  }

  downloadPDFList = () => {
    let { dataListStudent } = this.state;
    if (dataListStudent.length > 0) {
      var docDefinition = {
        content: [
          {
            text: 'Banco Municipal de Sangre del Distrito Capital',
            style: 'header',
          },
          {
            text: 'Dirección: Action Service C.A, Avenida Norte 1, Esquina de Pirineos, diagonal Hospital Vargas Cotiza 1010, San Jose, Caracas, Miranda',
            style: 'header',
          },
          {
            text: 'Teléfono: 0424-1055659',
            style: 'header',
          },
          {
            text: 'Listado de Estudiantes Inscritos',
            style: 'title'
          },
           this.table(dataListStudent, ['cedula', 'apellido', 'nombre', 'actividad', 'turno'])
        ],
	       styles: {
           table: {
             fontSize: 10,
             margin: [75, 10, 10, 75]
           },
           header: {
             fontSize: 12,
             italics: true,
             margin: [0, 10, 0, 5]
           },
           title: {
             fontSize: 14,
             bold: true,
             margin: [150, 50, 150, 50]
           }
         }
      }
      pdfMake.createPdf(docDefinition).download('Listado.pdf');
    }
  }

  downloadPDF = () => {
    let { dataEstudiante, dataInscripcion} = this.state;
    let text = null;
    if (dataInscripcion.nombre) {
      text = '  Quien suscribe, ARRAIZ YAQUELINE, Secretario(a) General de Banco Municipal de Sangre del Distrito Capital certifica: ' +
                 'que el(la) ciudadano(a) ' + dataEstudiante.apellido + ' ' + dataEstudiante.nombre + ', ' + 'Cédula de Identidad ' +
                 'Nº ' + dataEstudiante.cedula + ', cursó en esta Universidad el siguiente curso: ' + dataInscripcion.nombre;
    }else {
      text = '  Quien suscribe, ARRAIZ YAQUELINE, Secretario(a) General de la Universidad NOMBRE UNIVERSIDAD certifica: ' +
                 'que el(la) ciudadano(a) ' + dataEstudiante.apellido + ' ' + dataEstudiante.nombre + ', ' + 'Cédula de Identidad ' +
                 'Nº ' + dataEstudiante.cedula + ', no está inscripto a ningún curso en esta Universidad';
    }

    var docDefinition = {
        content: [
          {
            text: 'Banco Municipal de Sangre del Distrito Capital',
            style: 'header',
          },
          {
            text: 'Dirección: Action Service C.A, Avenida Norte 1, Esquina de Pirineos, diagonal Hospital Vargas Cotiza 1010, San Jose, Caracas, Miranda',
            style: 'header',
          },
          {
            text: 'Teléfono: 0424-1055659',
            style: 'header',
          },
          {
            text: 'Reporte del Estado del Estudiante',
            style: 'title',
          },
          {
            text: text,
            style: 'text',
          },
        ],
        styles: {
            header: {
              fontSize: 12,
              italics: true,
              margin: [0, 10, 0, 5]
            },
            text: {
                fontSize: 12
            },
            title: {
              fontSize: 14,
              bold: true,
              margin: [150, 50, 150, 50]
            }
        }
    }
    let titleFile = dataEstudiante.cedula + 'Constancia.pdf';
    pdfMake.createPdf(docDefinition).download(titleFile);
  }

  renderDataActividad = () => {
    let { valueActividad, dataActividad } = this.state;
    let id = valueActividad-1;
    if (dataActividad && valueActividad != '') {
      return (
        <div>
        <h3 style={{margin: '3%', color: '#fff'}}>Datos de la Actividad</h3>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Nombre de la Actividad</Table.HeaderCell>
              <Table.HeaderCell>Nombre Tutor</Table.HeaderCell>
              <Table.HeaderCell>Apellido Tutor</Table.HeaderCell>
              <Table.HeaderCell>Vacantes</Table.HeaderCell>
              <Table.HeaderCell>Numero de Inscriptos</Table.HeaderCell>
              <Table.HeaderCell>{dataActividad[id].inscripcion.length > 0 ? 'Descargar' : null }</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>{dataActividad[id].nombre}</Table.Cell>
              <Table.Cell>{dataActividad[id].profesor.length > 0 ? dataActividad[id].profesor[0].nombre : null}</Table.Cell>
              <Table.Cell>{dataActividad[id].profesor.length > 0 ? dataActividad[id].profesor[0].apellido : null}</Table.Cell>
              <Table.Cell>{dataActividad[id].vacantes}</Table.Cell>
              <Table.Cell>{dataActividad[id].inscripcion.length}</Table.Cell>
              <Table.Cell>{dataActividad[id].inscripcion.length > 0 ? <Form.Button onClick={this.downloadPDFList}>PDF</Form.Button> : null }</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
        </div>
      )
    }
  }

  renderListInscriptos = () => {
    let { dataListStudent } = this.state;
    if (dataListStudent.length > 0) {
      var indents = [];
      for (var i = 0; i < dataListStudent.length; i++) {
        indents.push(
          <Table.Row key={i}>
            <Table.Cell>{dataListStudent[i].estudianteId.cedula}</Table.Cell>
            <Table.Cell>{dataListStudent[i].estudianteId.apellido}</Table.Cell>
            <Table.Cell>{dataListStudent[i].estudianteId.nombre}</Table.Cell>
            <Table.Cell>{dataListStudent[i].actividadId.nombre}</Table.Cell>
            <Table.Cell>{dataListStudent[i].turno}</Table.Cell>
          </Table.Row>
        );
      }
      return (
        <div>
        <h3 style={{margin: '3%', color: '#fff'}}>Listado de Estudiantes Inscritos</h3>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Cédula</Table.HeaderCell>
              <Table.HeaderCell>Apellidos</Table.HeaderCell>
              <Table.HeaderCell>Nombres</Table.HeaderCell>
              <Table.HeaderCell>Nombre de la Actividad</Table.HeaderCell>
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

  render() {
    const { nombre, cedula, value, calificacion, textDropdownActividad } = this.state;
    return (
      <Form style={{margin: '5%'}} inverted>
        <h2 style={{margin: '5%', color: '#fff'}}>Generar Reportes</h2>
        { this.showError() }
        <Form.Group inline>
          <Form.Input label='Número Cédula' placeholder='Número Cédula' name='cedula' value={cedula} onChange={ this.handleChange } error={this.state.errorCedula}/>
          <Form.Button onClick={this.searchEstudiante}>Buscar Estudiante</Form.Button>
          <label style={{marginLeft: '3%'}}>{textDropdownActividad}</label>
          { this.showSelectActividad() }
        </Form.Group>
        { this.renderDataStudent() }
        { this.renderDataActividad() }
        { this.renderListInscriptos() }
      </Form>
    )
  }
}

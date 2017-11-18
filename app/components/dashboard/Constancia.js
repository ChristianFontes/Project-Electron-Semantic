import React, { Component } from 'react'
import { Form, Table, Message } from 'semantic-ui-react'
import { api } from '../../firebase/constants';
import axios from 'axios'
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import moment from 'moment'

export default class Constancia extends Component {
  constructor(props) {
    super(props)
    this.state = {
      cedula: '',
      dataEstudiante: null,
      errorMessage: '',
      errorCedula: false,
    }
  }

  handleChange = (e, { name }) => this.setState({ [name]: e.target.value })

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
        let data = response.data[0];
        if (data) {
          that.setState({
            dataEstudiante: data,
            errorMessage: '',
            errorCedula: false
          });
        }else{
          that.setState({
            dataEstudiante: null,
            errorMessage: 'Número de Cédula no se encuentra',
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
                <Table.HeaderCell>Email</Table.HeaderCell>
                <Table.HeaderCell>Telefono</Table.HeaderCell>
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
                <Table.Cell><Form.Button onClick={this.downloadPDF}>PDF</Form.Button></Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
        </div>
      )
    }
  }

  downloadPDF = () => {
    let { dataEstudiante } = this.state;
    let text = null;
    if (dataEstudiante) {
      text = '  Quien suscribe, ARRAIZ YAQUELINE, Secretario(a) General de Banco Municipal de Sangre del Distrito Capital certifica: ' +
                 'que el(la) ciudadano(a) ' + dataEstudiante.apellido + ' ' + dataEstudiante.nombre + ', ' + 'Cédula de Identidad ' +
                 'Nº ' + dataEstudiante.cedula + ', está cursando activades academicas a la fecha de expedición de esta Constancia de Estudio, a los ' +
                 moment().format("DD") + ' día(s) del mes de ' + moment().locale('es').format("MMMM") + ' del año ' + moment().format("YYYY") + '.';
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
            text: 'CONSTANCIA DE ESTUDIO',
            style: 'title',
          },
          {
            text: text,
            style: 'text',
          },
          {
            text: '_____________________________________',
            style: 'line',
          },
          {
            text: 'Dra. ARRAIZ YAQUELINE',
            style: 'footer',
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
              fontSize: 16,
              bold: true,
              margin: [150, 50, 150, 50]
            },
            line: {
              margin: [150, 50, 150, 10]
            },
            footer: {
              fontSize: 10,
              bold: true,
              margin: [200, 0, 200, 0]
            },
        }
    }
    let titleFile = dataEstudiante.cedula + 'Constancia_de_Estudios.pdf';
    pdfMake.createPdf(docDefinition).download(titleFile);
  }

  render() {
    const { cedula } = this.state;
    return (
      <Form style={{margin: '5%'}} inverted>
        <h2 style={{margin: '5%', color: '#fff'}}>Generar Constancia de Estudios</h2>
        { this.showError() }
        <Form.Group inline>
          <Form.Input label='Número Cédula' placeholder='Número Cédula' name='cedula' value={cedula} onChange={ this.handleChange } error={this.state.errorCedula}/>
          <Form.Button color='blue' onClick={this.searchEstudiante}>Buscar Estudiante</Form.Button>
        </Form.Group>
        { this.renderDataStudent() }
      </Form>
    )
  }
}

import React, { Component } from 'react'
import { Menu } from 'semantic-ui-react'
import PreInscripcion from './PreInscripcion'
import Inscripcion from './Inscripcion'
import Profesor from './Profesor'
import Actividad from './Actividad'
import Calificacion from './Calificacion'
import Reporte from './Reporte'
import Constancia from './Constancia'
import Perfil from './../../containers/PerfilPage'

export default class Header extends Component {
  constructor(props) {
    super(props)
    this.state = {
      activeItem: 'PreInscripcion',
      nombre: props.nombre,
      id: props.id
    }
  }

  handleItemClick = (e, { name }) => this.setState({ activeItem: name })

  componentClick = () => {
    const { activeItem } = this.state;
    let { user } = this.props;
    if (activeItem === 'PreInscripcion') {
      return <PreInscripcion />
    }else if (activeItem === 'Inscripcion') {
      return <Inscripcion />
    }else if (activeItem === 'Profesor') {
      return <Profesor />
    }else if (activeItem === 'Actividad') {
      return <Actividad />
    }else if (activeItem === 'Calificacion') {
      return <Calificacion />
    }else if (activeItem === 'Reporte') {
      return <Reporte />
    }else if (activeItem === 'Constancia') {
      return <Constancia />
    }else if (activeItem === 'Perfil') {
      return <Perfil user={user}/>
    }
  }

  render() {
    const { activeItem, nombre } = this.state;
    return (
      <div>
        <Menu>
          <Menu.Item header>Bienvenido {nombre}</Menu.Item>
          <Menu.Item name='PreInscripcion' active={activeItem === 'PreInscripcion'} onClick={this.handleItemClick} />
          <Menu.Item name='Inscripcion' active={activeItem === 'Inscripcion'} onClick={this.handleItemClick} />
          <Menu.Item name='Profesor' active={activeItem === 'Profesor'} onClick={this.handleItemClick} />
          <Menu.Item name='Actividad' active={activeItem === 'Actividad'} onClick={this.handleItemClick} />
          <Menu.Item name='Calificacion' active={activeItem === 'Calificacion'} onClick={this.handleItemClick} />
          <Menu.Item name='Reporte' active={activeItem === 'Reporte'} onClick={this.handleItemClick} />
          <Menu.Item name='Constancia' active={activeItem === 'Constancia'} onClick={this.handleItemClick} />
          <Menu.Item name='Perfil' active={activeItem === 'Perfil'} onClick={this.handleItemClick} />
        </Menu>
        { this.componentClick() }
      </div>
    )
  }
}

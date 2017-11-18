import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { bindActionCreators } from 'redux';
import Perfil from '../components/dashboard/Perfil';
import userActions from '../actions/user';

const mapStateToProps = (state) => {
  return state;
};

const mapDispatchToProps = (dispatch) => { // eslint-disable-line no-unused-vars
  const user = bindActionCreators(userActions, dispatch);
  return {
    save: (data) => {
      user.login(data);
      dispatch(push('/'));
    },
    logOut: () => {
      dispatch(push('/'));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Perfil);

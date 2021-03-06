import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { bindActionCreators } from 'redux';
import Login from '../components/login/Login';
import userActions from '../actions/user';

const mapStateToProps = (state) => {
  return state;
};

const mapDispatchToProps = (dispatch) => {
  const user = bindActionCreators(userActions, dispatch);
  return {
    onLogin: (data) => {
      user.login(data);
      dispatch(push('/dashboard'));
    },
    goSignUp: () => {
      dispatch(push('/signup'));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);

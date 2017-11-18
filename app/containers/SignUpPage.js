import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { bindActionCreators } from 'redux';
import SignUp from '../components/signup/SignUp';
import userActions from '../actions/user';

const mapStateToProps = (state) => {
  return state;
};

const mapDispatchToProps = (dispatch) => { // eslint-disable-line no-unused-vars
  const user = bindActionCreators(userActions, dispatch);
  return {
    onLogin: (data) => {
      user.login(data);
      dispatch(push('/dashboard'));
    },
    goLogin: () => {
      dispatch(push('/'));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SignUp);

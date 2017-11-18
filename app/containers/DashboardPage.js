import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { push } from 'react-router-redux';
import userActions from '../actions/user';
import Dashboard from '../components/dashboard/Dashboard';

const mapStateToProps = (state) => {
  return state;
};

const mapDispatchToProps = (dispatch) => { // eslint-disable-line no-unused-vars
  const user = bindActionCreators(userActions, dispatch);
  return {
    goLogin: (data) => {
      user.login(data);
      dispatch(push('/'));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);

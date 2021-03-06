import React, { Component } from 'react';
import Input from '../../components/UI/Input/Input';
import Button from '../../components/UI/Button/Button';
import Spinner from '../../components/UI/Spinner/Spinner';

import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import * as actions from '../../components/store/actions/index';

import { updateObject, checkValidity } from '../../components/shared/utility';

import classes from './Auth.module.css';

export class Auth extends Component {

    state = {
        controls: {
            email: {
                elementType: 'input',
                elementConfig: {
                    type: 'email',
                    placeholder: 'Your Email'
                },
                value: '',
                validation: {
                    required: true,
                    isEmail: true
                },
                valid: false,
                touched: false
            },
        password: {
            elementType: 'input',
            elementConfig: {
                type: 'password',
                placeholder: 'Your password'
            },
            value: '',
            validation: {
                required: true,
                minLength: 6
            },
            valid: false,
            touched: false
        }
      },
      formIsValid: true,
      isSignUp: true
    }

    inputChangedHandler = (event, inputIdentifier) => {

        const updatedControlsElem = updateObject(this.state.controls[inputIdentifier], {
            value: event.target.value,
            valid: checkValidity(event.target.value, this.state.controls[inputIdentifier].validation),
            touched: true
        });

        const updatedControls = updateObject(this.state.controls,{
            [inputIdentifier]: updatedControlsElem
        })

        // updating the overall validity
        let formIsValid = true;
        for(let inputIdentifier in updatedControls) {
            formIsValid = updatedControls[inputIdentifier].valid && formIsValid;
        }

        this.setState({controls: updatedControls, formIsValid: formIsValid});


    }

    submitHandler = (event) => {
        event.preventDefault();

        this.props.onAuth(this.state.controls.email.value, this.state.controls.password.value, this.state.isSignUp);
    }

    switchAuthModeHanlder = () => {
        this.setState(prevState => {
            return {isSignUp: !prevState.isSignUp}
        })
    }

    componentDidMount = () => {
      if(!this.props.buildingBurger && this.props.redirectPath !== '/') {
          this.props.setAuthRedirectPath('/');
      }
    }
    

    render() {

        const formElements = [];
        for (const key in this.state.controls) {
            if (this.state.controls.hasOwnProperty(key)) {
                formElements.push({
                    id: key,
                    config: this.state.controls[key]
                });
            }
        }
        let form = (
            <form onSubmit={this.submitHandler}>

                {formElements.map(formElement => (
                    <Input 
                        key={formElement.id}
                        elementType={formElement.config.elementType} 
                        elementConfig={formElement.config.elementConfig} 
                        value={formElement.config.value} 
                        invalid={!formElement.config.valid}
                        shouldValidate={formElement.config.validation}
                        touched={formElement.config.touched}
                        changed={(event) => this.inputChangedHandler(event, formElement.id)} 
                        inputName={formElement.id}
                    />
                ))}
                <Button btnType="Success" disabled={!this.state.formIsValid}>{this.state.isSignUp ? "REGISTER" : "LOGIN"}</Button>
            </form>
        );

        if(this.props.loading) {
            form = <Spinner/>
        }

        let errorMessage = null;
        if(this.props.error) {
            errorMessage = (
                <p>{this.props.error.message}</p>
            );
        }

        let authRedirect = null;
        if(this.props.isAuth) {
            authRedirect = <Redirect to={this.props.redirectPath}/>
        }

        return (
            <div className={classes.Auth}>
                    {authRedirect}
                    {errorMessage}
                    {form}
                    <Button 
                        btnType="Danger"
                        clicked={this.switchAuthModeHanlder}
                    >
                        {this.state.isSignUp ? "SWITCH TO LOGIN" : "SWITCH TO REGISTER"}
                    </Button>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        loading: state.auth.loading,
        error: state.auth.error,
        isAuth: state.auth.token !== null,
        redirectPath: state.auth.authRedirectPath,
        buildingBurger: state.burgerBuilder.building
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onAuth: (email, password, isSignUp) => dispatch(actions.auth(email, password, isSignUp)),
        setAuthRedirectPath: (path) => dispatch(actions.setAuthRedirectPath(path))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Auth);

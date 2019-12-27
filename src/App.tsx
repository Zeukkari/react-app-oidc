import React, { Component } from 'react';
import './App.css';
import { triggerLoginFlow, triggerLogoutFlow, configuration as defaultConfig } from './auth/authService';
import OidcManager from './auth/OidcManager';
import { User } from 'oidc-client';

class App extends Component<{}, { meta: { date: Date, timerID: null & any }, user?: { oidcUser?: User }, isLoggedIn: boolean }> {

  constructor(props: any) {
    super(props);
    this.state = {
      user: undefined,
      isLoggedIn: false,
      meta: {
        date: new Date(),
        timerID: null,
      }
    }
  }

  triggerLogin() {
    triggerLoginFlow();
    // OidcManager.init();
    // this.setState({ user: OidcManager.state });
  }

  triggerLogout() {
    triggerLogoutFlow();
  }

  tick() {
    this.setState(oldState => ({
      ...oldState,
      meta: {
        timerID: oldState.meta.timerID,
        date: new Date(),
      }
    }))
  }

  componentDidMount() {
    const updateUser = (result: any) => this.setState(oldState => ({ ...oldState, user: result, isLoggedIn: result.oidcUser?.id_token !== undefined }));
    OidcManager.init(defaultConfig).then((result: any) => { console.log("result: ", result); updateUser(result) });

    this.setState(oldState => ({
      ...oldState, meta: {
        ...oldState.meta, timerID: setInterval(
          () => this.tick(),
          1000
        )
      }
    }))
  }

  componentWillUnmount() {
    clearInterval(this.state.meta.timerID);
  }

  render() {
    return (
      <div className="App">
        <div>
          {this.state.isLoggedIn && (
            <h2>{`Hello ${this.state.user?.oidcUser?.profile.name}`}</h2>
          )}
          {!this.state.isLoggedIn && (
            <h2>{`You are not signed in`}</h2>
          )}
          <h2>It is {this.state.meta.date.toLocaleTimeString()}.</h2>
        </div>
        <span>
          <button className="button" disabled={this.state.isLoggedIn} onClick={() => this.triggerLogin()}> Login</button>
          <button className="button" disabled={!this.state.isLoggedIn} onClick={() => this.triggerLogout()}> Logout </button>
        </span>
        <div className="container">
          <div><h3>user info: </h3><div> <textarea value={JSON.stringify(this.state, null, '  ')}></textarea> <pre> {}</pre></div></div>
        </div>
      </div>
    )
  }
}

export default App;

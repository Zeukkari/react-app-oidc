import { UserManager, UserManagerSettings, User } from "oidc-client";
export default class OidcManager {
  public static userManager: UserManager;
  static _document: Document = document;
  static state: any = { oidcUser: null };

  static init(config: UserManagerSettings) {
    // console.log("init oidc manager...");
    this.userManager = new UserManager(config);
    const { events } = this.userManager;
    events.addUserLoaded(this.onUserLoaded);
    events.addSilentRenewError(this.onError);
    events.addUserUnloaded(this.onUserUnloaded);
    events.addUserSignedOut(this.onUserUnloaded);
    events.addAccessTokenExpired(this.onAccessTokenExpired);
    // console.log("events: ", events);
    
    if (document.location.toString().includes(`${config.redirect_uri}`)) {
      // console.log("signin redirecting... redirect_uri: ", config.redirect_uri);
      return this.userManager
        .signinRedirectCallback()
        .then(user => {
          // console.log("returned user from signinRedirectCallback user: ", user)
          
          if (user.state.url) {
            document.location = user.state.url;
          }
          
        })
        .then(() => {
          return this.userManager.getUser().then(user => {
            return { type: "callback", user: user };
          });
          
        });
    } else if (document.location.toString().includes(config.silent_redirect_uri)) {
      // console.log("silent redirect right?");
      return this.userManager.signinSilentCallback().then(() => ({ type: "callback" }));
    }
    // console.log("we are done?");    
    return this.userManager.getUser()
    .then(user => {
      this.state.oidcUser = user;
      return { type: "user", oidcUser: user };
    });
  }

  static getUserManager() {
    return this.userManager;
  }

  static onUserLoaded(user: User) {
    this.state = {
      oidcUser: user
    };
  };
  
  static onUserUnloaded() {
    this.state = {
      oidcUser: null
    };
  };
  
  static onAccessTokenExpired() {
    // console.log("this.state: ", this.state);
    this.state = {
      oidcUser: null
    };
    return this.userManager.signinSilent();
  };
  
  static onError(error: any) {
    this.state = {
      oidcUser: error,
    };
  };

  public static logout() {
    // console.log("logging out!");
    this.state = {
      oidcUser: null
    };
    if (this.userManager) {
      const { events } = this.userManager;
      events.removeUserLoaded(this.onUserLoaded);
      events.removeSilentRenewError(this.onError);
      events.removeUserUnloaded(this.onUserUnloaded);
      events.removeUserSignedOut(this.onUserUnloaded);
      events.removeAccessTokenExpired(this.onAccessTokenExpired);
      // console.log("logged out");
    } else {
      // console.log("no usermanager was found")
    }
  };
  
  public static signinSilent() {
    this.state = {
      oidcUser: null
    };
    return this.userManager.signinSilent();
  }
  
  public static signinRedirect(url?: string) {
    if (!url) {
      url = document.location.toString();
    }
    return this.userManager.signinRedirect({
      state: { url: url }
    });
  }
}

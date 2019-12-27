import OidcManager from './OidcManager';
import { UserManagerSettings } from 'oidc-client';

export const configuration: UserManagerSettings = {
  client_id: "https://api.hel.fi/auth/berths",
  redirect_uri: "http://localhost:3000/callback/",
  //redirect_uri: "https://oidcdebugger.com/debug",
  response_type: "id_token token",
  post_logout_redirect_uri: "http://localhost:3000/",
  scope: "openid https://api.hel.fi/auth/berths https://api.hel.fi/auth/helsinkiprofile",
  // authority: "https://tunnistamo.test.kuva.hel.ninja/",
  authority: "http://tunnistamo-backend:8000",
  silent_redirect_uri: "http://localhost:3000/silent_callback/",
  automaticSilentRenew: true,
  loadUserInfo: true
};

export const triggerLoginFlow = () => {
  console.log("init auth", configuration);
  OidcManager.init(configuration).then(function (status: any) {
    console.log("status: ", status);
    if (status.type !== "callback") {
      if (!status.user) {
        // start the signin
        OidcManager.signinRedirect();
      } else {
        // run you application
        console.log("My application started", status);
      }
    }
  })
}

export const triggerLogoutFlow = async () => {
  console.log("trigger logout");
  const user = await OidcManager.userManager.getUser();
  console.log("user: ", user);
  if(user != null) {
    OidcManager.getUserManager().signoutRedirect();
  }
}

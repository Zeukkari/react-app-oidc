import OidcManager from './OidcManager';
import { UserManagerSettings } from 'oidc-client';

export const configuration: UserManagerSettings = {
  client_id: "https://api.hel.fi/auth/berths-admin-ui",
  redirect_uri: "http://localhost:3000/callback",
  response_type: "id_token token",
  post_logout_redirect_uri: "http://localhost:3000",
  scope: "openid https://api.hel.fi/auth/berths https://api.hel.fi/auth/helsinkiprofile",
  //authority: "http://tunnistamo-backend:8000",
  authority: "https://tunnistamo.test.kuva.hel.ninja",
  silent_redirect_uri: "http://localhost:3000/silent_callback",
  automaticSilentRenew: true,
  loadUserInfo: true,
  revokeAccessTokenOnSignout: true,
  includeIdTokenInSilentRenew: true,

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
    const promise1 = new Promise(function(resolve, reject) {
      OidcManager.getUserManager().createSignoutRequest().then(req => {
        fetch(req.url, { credentials: "include" }).then(response => {
            resolve(response)
          }).catch(e => reject(e))
        })
    });
  }

 // OidcManager.getUserManager().signoutRedirect();
}

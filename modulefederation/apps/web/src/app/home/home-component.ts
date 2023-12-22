import { Component, OnInit } from "@angular/core";
import { OAuthService } from "angular-oauth2-oidc";
import { Feature } from "@modulefederation/portal";

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
@Feature({
  id: "home",
  label: "Home",
  visibility: ["public", "private"],
  categories: [],
  tags: ["navigation"],
  permissions: []
})
export class HomeComponent implements OnInit {
  // constructor

  constructor(private oauthService : OAuthService) {
  }

  userName() : string {
    const claims = this.oauthService.getIdentityClaims();
    if (!claims) return "";
    return claims['given_name'];
  }

  idToken() : string {
    return this.oauthService.getIdToken();
  }

  accessToken() : string {
    return this.oauthService.getAccessToken();
  }

  // public

  public executeSelectedChange = (event : any) => {
    console.log(event);
  }

  // implement OnInit

  ngOnInit() {
  }
}

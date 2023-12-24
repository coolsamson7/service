export interface OIDCUser {
    given_name : string
    family_name : string
    email : string
    email_verified : string
    name : string
    preferred_username : string
    sub : string

    // did we forget something?

    [prop : string] : any;
}

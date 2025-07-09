export function getLoggedInUser() {
    const token = localStorage.getItem("token");
    const rolename = localStorage.getItem("rolename");
    const IdToken = localStorage.getItem("IdToken") || '';
    const AccessToken = localStorage.getItem("AccessToken") || '';
    const userId = localStorage.getItem("id");
    return { token, rolename, IdToken, AccessToken, userId };
}
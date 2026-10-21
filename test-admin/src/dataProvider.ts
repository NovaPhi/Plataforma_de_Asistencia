import { fetchUtils, UrlField } from "react-admin";
import jsonServerProvider from "ra-data-json-server";
import { API_URL } from "./config";

const fetchJsonUtil=(url:string, options:fetchUtils.Options={})=>{
    if(!options.headers){
        options.headers= new Headers({Accept: "application/json"});
    }
    options.headers.set("Authentication", sessionStorage.getItem("auth"))
    return fetchUtils.fetchJson(url, options);
};

export const dataProvider = jsonServerProvider(API_URL, fetchJsonUtil)
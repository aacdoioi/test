import { onRequestGet as __api_applications_js_onRequestGet } from "C:\\GitHub\\test\\functions\\api\\applications.js"
import { onRequestPost as __api_applications_js_onRequestPost } from "C:\\GitHub\\test\\functions\\api\\applications.js"
import { onRequestPut as __api_applications_js_onRequestPut } from "C:\\GitHub\\test\\functions\\api\\applications.js"
import { onRequestDelete as __api_tournaments_js_onRequestDelete } from "C:\\GitHub\\test\\functions\\api\\tournaments.js"
import { onRequestGet as __api_tournaments_js_onRequestGet } from "C:\\GitHub\\test\\functions\\api\\tournaments.js"
import { onRequestPost as __api_tournaments_js_onRequestPost } from "C:\\GitHub\\test\\functions\\api\\tournaments.js"
import { onRequestPut as __api_tournaments_js_onRequestPut } from "C:\\GitHub\\test\\functions\\api\\tournaments.js"

export const routes = [
    {
      routePath: "/api/applications",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_applications_js_onRequestGet],
    },
  {
      routePath: "/api/applications",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_applications_js_onRequestPost],
    },
  {
      routePath: "/api/applications",
      mountPath: "/api",
      method: "PUT",
      middlewares: [],
      modules: [__api_applications_js_onRequestPut],
    },
  {
      routePath: "/api/tournaments",
      mountPath: "/api",
      method: "DELETE",
      middlewares: [],
      modules: [__api_tournaments_js_onRequestDelete],
    },
  {
      routePath: "/api/tournaments",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_tournaments_js_onRequestGet],
    },
  {
      routePath: "/api/tournaments",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_tournaments_js_onRequestPost],
    },
  {
      routePath: "/api/tournaments",
      mountPath: "/api",
      method: "PUT",
      middlewares: [],
      modules: [__api_tournaments_js_onRequestPut],
    },
  ]
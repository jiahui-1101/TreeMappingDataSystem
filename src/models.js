/**
 * @typedef {"admin" | "ranger" | "visitor" | "it-support"} Role
 *
 * @typedef {Object} TreeRecord
 * @property {string} id
 * @property {string} name
 * @property {string} scientificName
 * @property {string} zone
 * @property {number} age
 * @property {number} height
 * @property {number} health
 * @property {"healthy" | "monitor" | "critical"} status
 * @property {boolean} rare
 * @property {number} x
 * @property {number} y
 * @property {string} description
 *
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} title
 * @property {string} treeId
 * @property {string} ranger
 * @property {string} source
 * @property {"urgent" | "high" | "normal"} priority
 * @property {"pending" | "in-progress" | "completed" | "escalated"} status
 * @property {string} notes
 *
 * @typedef {Object} AuditEvent
 * @property {string} time
 * @property {"edit" | "login" | "alert" | "error" | "security"} type
 * @property {string} actor
 * @property {string} role
 * @property {string} event
 * @property {string} severity
 */

export const ROLE = Object.freeze({
  ADMIN: "admin",
  RANGER: "ranger",
  VISITOR: "visitor",
  IT_SUPPORT: "it-support",
});

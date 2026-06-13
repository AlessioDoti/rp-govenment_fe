/***
 * Domain models — JSDoc typedefs (single source of truth per il typing lato IDE).
 *
 * @typedef {'admin'|'government'|'activity'|'citizen'} Role
 *
 * @typedef {Object} UserPublic
 * @property {string} username
 * @property {string} firstname
 * @property {string} lastname
 * @property {string} name
 * @property {Role} role
 *
 * @typedef {Object} UserCredentials
 * @property {string} username
 * @property {string} password
 *
 * @typedef {Object} CategoryTax
 * @property {number} id
 * @property {number} amount Soglia inferiore dello scaglione (inclusiva)
 * @property {number} rate Aliquota percentuale (es. 20 = 20%)
 *
 * @typedef {Object} Category
 * @property {number} id
 * @property {string} name
 * @property {CategoryTax[]} categoryTaxes Scaglioni fiscali progressivi ordinati
 *
 * @typedef {Object} Activity
 * @property {number} id
 * @property {string} name
 * @property {number|string|Object} category ID categoria (mock) oppure CategoryDTO annidato (backend)
 * @property {string} [manager] Username del gestore — non presente nelle attività del backend
 * @property {number} [taxDue] Tasse dovute — non presente nelle attività del backend
 * @property {number} [taxPaid] Tasse pagate — non presente nelle attività del backend
 * @property {string[]} [employees] Dipendenti — non presente nel backend
 *
 * @typedef {Object} SessionUser
 * @property {string} username
 * @property {Role} role
 * @property {string} name
 */

export {}

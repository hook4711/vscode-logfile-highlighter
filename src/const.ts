export const STD_ERR          = '[stderr]';

export const REGEX_START      = new RegExp('^.*\[org\.jboss\.as\].*WildFly Full.*starting$');
export const REGEX_STARTED    = new RegExp('^.*WildFly Full.*started in.*$');
export const REGEX_DEPLOYED   = new RegExp(' Deployed.*');
export const REGEX_EXCEPTION  = new RegExp('^.*(SEVERE|ERROR).*$');

export const REGEX_ISO_DATE   = new RegExp('(\b\d{4}-\d{2}-\d{2}(T|\b))');
export const REGEX_LOCAL_DATE = new RegExp('((?<=(^|\s))\d{2}[^\w\s]\d{2}[^\w\s]\d{4}\b)');
export const REGEX_TIME       = new RegExp('(\d{1,2}:\d{2}(:\d{2}([.,]\d{1,})?)?(Z| ?[+-]\d{1,2}:\d{2})?\b)');

export enum ItemType {Root, Start, Started, Deployed, Exception, Stopped, Unknown};
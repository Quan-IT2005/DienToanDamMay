var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ../../../Users/quan/AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");

// ../../../Users/quan/AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  static {
    __name(this, "PerformanceEntry");
  }
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
var PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
  static {
    __name(this, "PerformanceMark");
  }
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
var PerformanceMeasure = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceMeasure");
  }
  entryType = "measure";
};
var PerformanceResourceTiming = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceResourceTiming");
  }
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
var PerformanceObserverEntryList = class {
  static {
    __name(this, "PerformanceObserverEntryList");
  }
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
var Performance = class {
  static {
    __name(this, "Performance");
  }
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
var PerformanceObserver = class {
  static {
    __name(this, "PerformanceObserver");
  }
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
var performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();

// ../../../Users/quan/AppData/Roaming/npm/node_modules/wrangler/node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
if (!("__unenv__" in performance)) {
  const proto = Performance.prototype;
  for (const key of Object.getOwnPropertyNames(proto)) {
    if (key !== "constructor" && !(key in performance)) {
      const desc = Object.getOwnPropertyDescriptor(proto, key);
      if (desc) {
        Object.defineProperty(performance, key, desc);
      }
    }
  }
}
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// ../../../Users/quan/AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";

// ../../../Users/quan/AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default = Object.assign(() => {
}, { __unenv__: true });

// ../../../Users/quan/AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/console.mjs
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;

// ../../../Users/quan/AppData/Roaming/npm/node_modules/wrangler/node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole = globalThis["console"];
var {
  assert,
  clear: clear2,
  // @ts-expect-error undocumented public API
  context,
  count: count2,
  countReset: countReset2,
  // @ts-expect-error undocumented public API
  createTask: createTask2,
  debug: debug2,
  dir: dir2,
  dirxml: dirxml2,
  error: error2,
  group: group2,
  groupCollapsed: groupCollapsed2,
  groupEnd: groupEnd2,
  info: info2,
  log: log2,
  profile: profile2,
  profileEnd: profileEnd2,
  table: table2,
  time: time2,
  timeEnd: timeEnd2,
  timeLog: timeLog2,
  timeStamp: timeStamp2,
  trace: trace2,
  warn: warn2
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
var console_default = workerdConsole;

// ../../../Users/quan/AppData/Roaming/npm/node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
globalThis.console = console_default;

// ../../../Users/quan/AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
  return BigInt(Date.now() * 1e6);
}, "bigint") });

// ../../../Users/quan/AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// ../../../Users/quan/AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream = class {
  static {
    __name(this, "ReadStream");
  }
  fd;
  isRaw = false;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
};

// ../../../Users/quan/AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream = class {
  static {
    __name(this, "WriteStream");
  }
  fd;
  columns = 80;
  rows = 24;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  clearLine(dir3, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count3, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  write(str, encoding, cb) {
    if (str instanceof Uint8Array) {
      str = new TextDecoder().decode(str);
    }
    try {
      console.log(str);
    } catch {
    }
    cb && typeof cb === "function" && cb();
    return false;
  }
};

// ../../../Users/quan/AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION = "22.14.0";

// ../../../Users/quan/AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class _Process extends EventEmitter {
  static {
    __name(this, "Process");
  }
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  // --- event emitter ---
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  // --- stdio (lazy initializers) ---
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  // --- cwd ---
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  // --- dummy props and getters ---
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return `v${NODE_VERSION}`;
  }
  get versions() {
    return { node: NODE_VERSION };
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  // --- noop methods ---
  ref() {
  }
  unref() {
  }
  // --- unimplemented methods ---
  umask() {
    throw createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw createNotImplementedError("process.kill");
  }
  abort() {
    throw createNotImplementedError("process.abort");
  }
  dlopen() {
    throw createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw createNotImplementedError("process.openStdin");
  }
  assert() {
    throw createNotImplementedError("process.assert");
  }
  binding() {
    throw createNotImplementedError("process.binding");
  }
  // --- attached interfaces ---
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: /* @__PURE__ */ __name(() => 0, "rss") });
  // --- undefined props ---
  mainModule = void 0;
  domain = void 0;
  // optional
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  // internals
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};

// ../../../Users/quan/AppData/Roaming/npm/node_modules/wrangler/node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var workerdProcess = getBuiltinModule("node:process");
var unenvProcess = new Process({
  env: globalProcess.env,
  hrtime,
  // `nextTick` is available from workerd process v1
  nextTick: workerdProcess.nextTick
});
var { exit, features, platform } = workerdProcess;
var {
  _channel,
  _debugEnd,
  _debugProcess,
  _disconnect,
  _events,
  _eventsCount,
  _exiting,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _handleQueue,
  _kill,
  _linkedBinding,
  _maxListeners,
  _pendingMessage,
  _preload_modules,
  _rawDebug,
  _send,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  arch,
  argv,
  argv0,
  assert: assert2,
  availableMemory,
  binding,
  channel,
  chdir,
  config,
  connected,
  constrainedMemory,
  cpuUsage,
  cwd,
  debugPort,
  disconnect,
  dlopen,
  domain,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exitCode,
  finalization,
  getActiveResourcesInfo,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getMaxListeners,
  getuid,
  hasUncaughtExceptionCaptureCallback,
  hrtime: hrtime3,
  initgroups,
  kill,
  listenerCount,
  listeners,
  loadEnvFile,
  mainModule,
  memoryUsage,
  moduleLoadList,
  nextTick,
  off,
  on,
  once,
  openStdin,
  permission,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  reallyExit,
  ref,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  send,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setMaxListeners,
  setSourceMapsEnabled,
  setuid,
  setUncaughtExceptionCaptureCallback,
  sourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  throwDeprecation,
  title,
  traceDeprecation,
  umask,
  unref,
  uptime,
  version,
  versions
} = unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
var process_default = _process;

// ../../../Users/quan/AppData/Roaming/npm/node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
globalThis.process = process_default;

// worker/index.js
var COUNTRY_PROFILES = {
  VN: { name: "Vi\u1EC7t Nam", currency: "VND", rpmBase: 0.8, rpmHigh: 2.5, lang: "vi", gl: "VN" },
  US: { name: "Hoa K\u1EF3 (US)", currency: "USD", rpmBase: 6, rpmHigh: 24, lang: "en", gl: "US" },
  GB: { name: "V\u01B0\u01A1ng Qu\u1ED1c Anh (UK)", currency: "GBP", rpmBase: 5.5, rpmHigh: 20, lang: "en", gl: "GB" },
  JP: { name: "Nh\u1EADt B\u1EA3n (JP)", currency: "JPY", rpmBase: 4.5, rpmHigh: 16, lang: "ja", gl: "JP" },
  KR: { name: "H\xE0n Qu\u1ED1c (KR)", currency: "KRW", rpmBase: 4, rpmHigh: 14, lang: "ko", gl: "KR" },
  DE: { name: "\u0110\u1EE9c (DE)", currency: "EUR", rpmBase: 5, rpmHigh: 18, lang: "de", gl: "DE" },
  AU: { name: "\xDAc (AU)", currency: "AUD", rpmBase: 5, rpmHigh: 19, lang: "en", gl: "AU" },
  GLOBAL: { name: "To\xE0n c\u1EA7u (Global)", currency: "USD", rpmBase: 4, rpmHigh: 15, lang: "en", gl: "US" }
};
var DOMAIN_CPM = [
  { keywords: ["finance", "crypto", "bitcoin", "invest", "tai chinh", "chung khoan", "tien ao", "real estate", "bds", "kiem tien"], factor: 2.4, label: "T\xE0i ch\xEDnh & \u0110\u1EA7u t\u01B0" },
  { keywords: ["tech", "software", "code", "ai", "laptop", "cong nghe", "lap trinh", "saas", "dien thoai", "pc"], factor: 1.8, label: "C\xF4ng ngh\u1EC7 & AI" },
  { keywords: ["business", "marketing", "ecommerce", "kinh doanh", "ban hang", "dropship", "startup"], factor: 1.9, label: "Kinh doanh & Marketing" },
  { keywords: ["fitness", "gym", "diet", "health", "giam can", "suc khoe", "an uong", "the hinh"], factor: 1.3, label: "S\u1EE9c kh\u1ECFe & Th\u1EC3 h\xECnh" },
  { keywords: ["travel", "food", "du lich", "am thuc", "nau an", "vlog", "an sap", "quan an"], factor: 1.1, label: "Du l\u1ECBch & \u1EA8m th\u1EF1c" },
  { keywords: ["gaming", "game", "esports", "choi game", "lien quan", "free fire", "valorant"], factor: 0.7, label: "Gaming" },
  { keywords: ["entertainment", "hai", "phim", "reaction", "drama", "show"], factor: 0.6, label: "Gi\u1EA3i tr\xED & Reaction" }
];
function detectDomainCPM(keyword) {
  const kw = keyword.toLowerCase();
  for (const d of DOMAIN_CPM) {
    if (d.keywords.some((k) => kw.includes(k))) {
      return d;
    }
  }
  return { factor: 1, label: "\u0110a ch\u1EE7 \u0111\u1EC1 / Ti\xEAu d\xF9ng" };
}
__name(detectDomainCPM, "detectDomainCPM");
function detectWinningPattern(title2) {
  const t = title2.toLowerCase();
  if (t.includes("how to") || t.includes("h\u01B0\u1EDBng d\u1EABn") || t.includes("c\xE1ch") || t.includes("l\xE0m sao") || t.includes("tutorial") || t.includes("b\u01B0\u1EDBc")) {
    return { pattern: "How-To & H\u01B0\u1EDBng D\u1EABn T\u1EEBng B\u01B0\u1EDBc", icon: "\u{1F6E0}\uFE0F", why: "Gi\u1EA3i quy\u1EBFt tr\u1EF1c di\u1EC7n th\u1EAFc m\u1EAFc c\u1EA5p thi\u1EBFt c\u1EE7a ng\u01B0\u1EDDi xem, l\u01B0\u1EE3ng t\xECm ki\u1EBFm d\xE0i h\u1EA1n (Evergreen)." };
  }
  if (t.includes("vs") || t.includes("so s\xE1nh") || t.includes("compare") || t.includes("versus") || t.includes("n\xEAn mua") || t.includes("\u0111\xE1nh gi\xE1") || t.includes("review")) {
    return { pattern: "Review / So S\xE1nh / \u0110\xE1nh Gi\xE1 Th\u1EF1c T\u1EBF", icon: "\u2696\uFE0F", why: "T\xE1c \u0111\u1ED9ng th\u1EB3ng v\xE0o ng\u01B0\u1EDDi xem \u0111ang c\xE2n nh\u1EAFc ch\u1ECDn l\u1EF1a ho\u1EB7c mua s\u1EAFm (High Intent)." };
  }
  if (t.includes("b\xED m\u1EADt") || t.includes("sai l\u1EA7m") || t.includes("\u0111\u1EEBng") || t.includes("mistake") || t.includes("never") || t.includes("secret") || t.includes("s\u1EF1 th\u1EADt") || t.includes("c\u1EA3nh b\xE1o") || t.includes("b\u1EABy")) {
    return { pattern: "C\u1EA3nh B\xE1o / Sai L\u1EA7m / B\xED M\u1EADt B\u1ECB Gi\u1EA5u", icon: "\u{1F6A8}", why: "K\xEDch ho\u1EA1t t\xE2m l\xFD s\u1EE3 m\u1EA5t m\xE1t (FOMO) v\xE0 t\xF2 m\xF2, mang l\u1EA1i t\u1EF7 l\u1EC7 nh\u1EA5p (CTR) cao nh\u1EA5t." };
  }
  if (t.includes("top") || t.includes("nh\u1EA5t") || t.includes("danh s\xE1ch") || t.includes("best") || /\d+/.test(t)) {
    return { pattern: "Danh S\xE1ch Top List C\xF3 Con S\u1ED1", icon: "\u{1F522}", why: "Con s\u1ED1 c\u1EE5 th\u1EC3 t\u1EA1o c\u1EA3m gi\xE1c th\xF4ng tin \u0111\xE3 \u0111\u01B0\u1EE3c ch\u1ECDn l\u1ECDc c\xF4 \u0111\u1ECDng, ng\u01B0\u1EDDi xem d\u1EC5 b\u1EA5m v\xE0o." };
  }
  if (t.includes("?") || t.includes("t\u1EA1i sao") || t.includes("li\u1EC7u") || t.includes("what if") || t.includes("why") || t.includes("c\xF3 n\xEAn")) {
    return { pattern: "C\xE2u H\u1ECFi M\xF3c N\u1ED1i T\xF2 M\xF2 (Curiosity Hook)", icon: "\u2753", why: "T\u1EA1o s\u1EF1 k\xEDch th\xEDch \u0111\u1EC3 ng\u01B0\u1EDDi xem xem ti\u1EBFp nh\u1EB1m gi\u1EA3i m\xE3 c\xE2u tr\u1EA3 l\u1EDDi." };
  }
  return { pattern: "Tr\u1EA3i Nghi\u1EC7m Th\u1EF1c T\u1EBF & K\u1EC3 Chuy\u1EC7n", icon: "\u{1F4D6}", why: "Gi\u1EEF ch\xE2n ng\u01B0\u1EDDi xem b\u1EB1ng c\u1ED1t truy\u1EC7n, t\xEDnh ch\xE2n th\u1EF1c v\xE0 c\xE1 t\xEDnh c\u1EE7a t\xE1c gi\u1EA3." };
}
__name(detectWinningPattern, "detectWinningPattern");
function parseViewsText(str) {
  if (!str) return 0;
  const s = str.trim().toLowerCase();
  const match = s.match(/([\d.,]+)\s*(triệu|tr|m|k|nghìn|ngàn|b)?/);
  if (!match) return 0;
  const numStr = match[1];
  const unit = match[2] || "";
  if (unit === "tri\u1EC7u" || unit === "tr" || unit === "m") {
    return Math.round(parseFloat(numStr.replace(",", ".")) * 1e6);
  }
  if (unit === "k" || unit === "ngh\xECn" || unit === "ng\xE0n") {
    return Math.round(parseFloat(numStr.replace(",", ".")) * 1e3);
  }
  if (unit === "b") {
    return Math.round(parseFloat(numStr.replace(",", ".")) * 1e9);
  }
  return parseInt(numStr.replace(/[.,]/g, "") || "0", 10);
}
__name(parseViewsText, "parseViewsText");
function parsePublishedText(str) {
  if (!str) return 30;
  const s = str.toLowerCase();
  const num = parseInt(s.match(/\d+/)?.[0] || "1", 10);
  if (s.includes("gi\u1EDD") || s.includes("hour")) return Math.max(num / 24, 0.05);
  if (s.includes("ng\xE0y") || s.includes("day")) return num;
  if (s.includes("tu\u1EA7n") || s.includes("week")) return num * 7;
  if (s.includes("th\xE1ng") || s.includes("month")) return num * 30;
  if (s.includes("n\u0103m") || s.includes("year")) return num * 365;
  return 30;
}
__name(parsePublishedText, "parsePublishedText");
var worker_default = {
  async fetch(request, env2) {
    const url = new URL(request.url);
    if (url.pathname === "/api/analyze" && request.method === "POST") {
      return handleAnalyze(request, env2);
    }
    if (url.pathname === "/api/history" && request.method === "GET") {
      return handleHistory(request, env2);
    }
    if (url.pathname === "/api/export-csv" && request.method === "GET") {
      return handleExportCSV(url, env2);
    }
    if (url.pathname === "/api/export-strategy" && request.method === "GET") {
      return handleExportStrategy(url, env2);
    }
    if (url.pathname === "/api/countries" && request.method === "GET") {
      return new Response(JSON.stringify(COUNTRY_PROFILES), {
        headers: { "Content-Type": "application/json" }
      });
    }
    if (env2.ASSETS) {
      return env2.ASSETS.fetch(request);
    }
    return new Response("Not Found", { status: 404 });
  }
};
async function handleAnalyze(request, env2) {
  try {
    const body = await request.json();
    const keyword = (body.keyword || "").trim();
    const regionCode = (body.regionCode || "VN").toUpperCase();
    const customApiKey = (body.apiKey || "").trim();
    const apiKey = customApiKey || env2.YOUTUBE_API_KEY || "";
    if (!keyword) {
      return jsonError("Vui l\xF2ng nh\u1EADp t\u1EEB kh\xF3a ho\u1EB7c t\xEAn ng\xE1ch c\u1EA7n ph\xE2n t\xEDch.", 400);
    }
    const cacheKey = `search_v2:${keyword.toLowerCase()}:${regionCode}`;
    if (env2.DB) {
      try {
        const cached = await env2.DB.prepare(
          "SELECT payload FROM api_cache WHERE cache_key = ? AND expires_at > ?"
        ).bind(cacheKey, Date.now()).first();
        if (cached && cached.payload) {
          const parsed = JSON.parse(cached.payload);
          return new Response(JSON.stringify({ ...parsed, fromCache: true }), {
            headers: { "Content-Type": "application/json" }
          });
        }
      } catch (err) {
        console.warn("D1 cache read warning:", err.message);
      }
    }
    const result = await performNicheAnalysis(keyword, regionCode, apiKey);
    if (env2.DB) {
      try {
        const searchId = `niche_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        await env2.DB.prepare(
          `INSERT INTO niche_searches 
          (id, keyword, region_code, opportunity_score, demand_score, competition_score, monetization_score, breakout_score, verdict, data_json, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          searchId,
          keyword,
          regionCode,
          result.scores.opportunity,
          result.scores.demand,
          result.scores.competition,
          result.scores.monetization,
          result.scores.breakout,
          result.verdict.title,
          JSON.stringify(result),
          Date.now()
        ).run();
        for (const video of result.competitors.slice(0, 20)) {
          await env2.DB.prepare(
            `INSERT INTO competitor_videos 
            (id, search_id, video_id, title, channel_title, channel_id, published_at, view_count, subscriber_count, outlier_multiplier, vph, winning_pattern, thumbnail_url, video_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          ).bind(
            `vid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            searchId,
            video.id,
            video.title,
            video.channelTitle,
            video.channelId,
            video.publishedAt,
            video.views,
            video.subscribers,
            video.outlierMultiplier,
            video.vph,
            video.pattern.pattern,
            video.thumbnail,
            video.url
          ).run();
        }
        await env2.DB.prepare(
          "INSERT OR REPLACE INTO api_cache (cache_key, payload, created_at, expires_at) VALUES (?, ?, ?, ?)"
        ).bind(cacheKey, JSON.stringify(result), Date.now(), Date.now() + 3 * 3600 * 1e3).run();
      } catch (err) {
        console.warn("D1 save warning:", err.message);
      }
    }
    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return jsonError(err.message || "L\u1ED7i x\u1EED l\xFD h\u1EC7 th\u1ED1ng", 500);
  }
}
__name(handleAnalyze, "handleAnalyze");
async function performNicheAnalysis(keyword, regionCode, apiKey) {
  let videos = [];
  let dataSource = "LIVE_YOUTUBE_WEB";
  if (apiKey) {
    try {
      videos = await fetchYouTubeDataViaAPI(keyword, regionCode, apiKey);
      dataSource = "LIVE_YOUTUBE_API";
    } catch (apiErr) {
      console.warn("YouTube API failed, fallback to Live Search Engine:", apiErr.message);
      videos = await fetchLiveYouTubeSearch(keyword, regionCode);
    }
  } else {
    videos = await fetchLiveYouTubeSearch(keyword, regionCode);
  }
  const country = COUNTRY_PROFILES[regionCode] || COUNTRY_PROFILES.VN;
  const domainInfo = detectDomainCPM(keyword);
  const now = Date.now();
  const processedVideos = videos.map((v) => {
    const ageHours = Math.max(v.ageDays * 24, 1);
    const vph = Math.round(v.views / ageHours);
    const subsSafe = Math.max(v.subscribers || 1e3, 500);
    const outlierMultiplier = parseFloat((v.views / subsSafe).toFixed(2));
    const pattern = detectWinningPattern(v.title);
    return {
      ...v,
      vph,
      outlierMultiplier,
      pattern,
      isBreakout: outlierMultiplier >= 2 || v.subscribers < 4e4 && v.views > 8e4
    };
  });
  processedVideos.sort((a, b) => b.outlierMultiplier - a.outlierMultiplier);
  const totalViews = processedVideos.reduce((acc, v) => acc + v.views, 0);
  const avgViews = Math.round(totalViews / (processedVideos.length || 1));
  const breakoutCount = processedVideos.filter((v) => v.isBreakout).length;
  const smallChannelCount = processedVideos.filter((v) => (v.subscribers || 0) < 5e4).length;
  const demandRaw = Math.min(100, Math.round(Math.log10(Math.max(avgViews, 500)) / 5.8 * 100));
  const demandScore = Math.max(25, Math.min(98, demandRaw));
  const megaChannelRatio = processedVideos.filter((v) => (v.subscribers || 0) > 3e5).length / (processedVideos.length || 1);
  const competitionScore = Math.round(Math.min(95, Math.max(20, megaChannelRatio * 80 + (1 - smallChannelCount / (processedVideos.length || 1)) * 35)));
  const lowSupplyScore = 100 - competitionScore;
  const breakoutScore = Math.min(98, Math.max(15, Math.round(breakoutCount / (processedVideos.length || 1) * 110 + smallChannelCount / (processedVideos.length || 1) * 40)));
  const estimatedRpm = parseFloat((country.rpmBase * domainInfo.factor * 1.4).toFixed(2));
  const monetizationScore = Math.min(98, Math.max(20, Math.round(estimatedRpm / country.rpmHigh * 90 + domainInfo.factor * 10)));
  const geomProduct = demandScore * lowSupplyScore * monetizationScore * breakoutScore;
  const opportunityScore = Math.round(Math.pow(geomProduct, 0.25));
  let verdict = {
    level: "HIGH",
    badge: "\u{1F680} C\u01A1 H\u1ED9i V\xE0ng (R\u1EA5t Kh\u1EA3 Thi)",
    color: "#10b981",
    title: "Ng\xE1ch \u0110\u1EA7y Ti\u1EC1m N\u0103ng \u2014 N\xEAn Tri\u1EC3n Khai S\u1EDBm",
    summary: `Nhu c\u1EA7u t\xECm ki\u1EBFm \u1EDF m\u1EE9c cao (${demandScore}/100), trong khi c\xE1c k\xEAnh nh\u1ECF v\u1EABn c\xF3 c\u01A1 h\u1ED9i \u0111\u1EA1t h\xE0ng ch\u1EE5c \u0111\u1EBFn h\xE0ng tr\u0103m ngh\xECn view. K\xEAnh m\u1EDBi c\xF3 t\u1EF7 l\u1EC7 b\u1EE9t ph\xE1 cao n\u1EBFu b\xE1m theo c\xE1c ch\u1EE7 \u0111\u1EC1 Outlier c\xF3 s\u1EB5n.`
  };
  if (opportunityScore < 45) {
    verdict = {
      level: "LOW",
      badge: "\u26D4 C\u1EA1nh Tranh Kh\u1ED1c Li\u1EC7t / Nhu C\u1EA7u H\u1EB9p",
      color: "#ef4444",
      title: "Kh\xF3 Kh\u0103n Cho K\xEAnh M\u1EDBi \u2014 C\u1EA7n Thu H\u1EB9p Ng\xE1ch",
      summary: `Ng\xE1ch n\xE0y b\u1ECB \xE1p \u0111\u1EA3o b\u1EDFi c\xE1c k\xEAnh th\u01B0\u01A1ng hi\u1EC7u l\u1EDBn (M\u1EE9c c\u1EA1nh tranh ${competitionScore}/100) ho\u1EB7c ng\u01B0\u1EDDi xem kh\xF4ng t\xECm ki\u1EBFm th\u01B0\u1EDDng xuy\xEAn. B\u1EA1n c\u1EA7n ch\u1ECDn m\u1ED9t g\xF3c nh\xECn con c\u1EE5 th\u1EC3 h\u01A1n.`
    };
  } else if (opportunityScore < 65) {
    verdict = {
      level: "MODERATE",
      badge: "\u2696\uFE0F Kh\u1EA3 Thi C\xF3 \u0110i\u1EC1u Ki\u1EC7n",
      color: "#f59e0b",
      title: "C\u1EA7n Ch\u1ECDn G\xF3c Nh\xECn M\u1EDBi (Unique Angle)",
      summary: `Ng\xE1ch c\xF3 l\u01B0\u1EE3ng kh\xE1n gi\u1EA3 \u1ED5n \u0111\u1ECBnh nh\u01B0ng \u0111\u1ED1i th\u1EE7 c\u0169ng kh\xE1 nhi\u1EC1u. B\u1EA1n c\u1EA7n \u0111\u1EA7u t\u01B0 v\xE0o thumbnail b\u1EAFt m\u1EAFt, ti\xEAu \u0111\u1EC1 d\u1EA1ng C\u1EA3nh b\xE1o/So s\xE1nh v\xE0 k\u1ECBch b\u1EA3n cu\u1ED1n h\xFAt \u0111\u1EC3 c\u1EA1nh tranh.`
    };
  }
  const contentGaps = [
    { topic: `So s\xE1nh chi ti\u1EBFt & Top sai l\u1EA7m th\u01B0\u1EDDng g\u1EB7p nh\u1EA5t v\u1EC1 "${keyword}"`, potential: "R\u1EA5t cao", reason: "Kh\xE1n gi\u1EA3 lu\xF4n t\xECm ki\u1EBFm s\u1EF1 \u0111\u1EA3m b\u1EA3o v\xE0 c\xE2u tr\u1EA3 l\u1EDDi kh\xE1ch quan tr\u01B0\u1EDBc khi b\u1EAFt tay l\xE0m ho\u1EB7c mua." },
    { topic: `Th\u1EF1c t\u1EBF tr\u1EA3i nghi\u1EC7m 30 ng\xE0y: K\u1EBFt qu\u1EA3 th\u1EADt v\u1EC1 "${keyword}"`, potential: "Cao", reason: "\u0110\u1ECBnh d\u1EA1ng Challenge / Storytelling lu\xF4n gi\u1EEF ch\xE2n ng\u01B0\u1EDDi xem t\u1ED1t nh\u1EA5t (Average View Duration > 50%)." },
    { topic: `Nh\u1EEFng \u0111i\u1EC1u \xEDt ai n\xF3i cho b\u1EA1n bi\u1EBFt v\u1EC1 "${keyword}" n\u0103m 2025 - 2026`, potential: "Cao", reason: "\u0110\xE1nh tr\xFAng t\xE2m l\xFD t\xF2 m\xF2 v\xE0 t\xEDnh th\u1EDDi s\u1EF1, t\u1EF7 l\u1EC7 click (CTR) cao nh\u1EA5t ng\xE1ch." },
    { topic: `H\u01B0\u1EDBng d\u1EABn to\xE0n di\u1EC7n t\u1EEB A-Z cho ng\u01B0\u1EDDi m\u1EDBi b\u1EAFt \u0111\u1EA7u: "${keyword}"`, potential: "Trung b\xECnh", reason: "Video tr\u1EE5 c\u1ED9t mang l\u1EA1i l\u01B0\u1EE3t view t\xECm ki\u1EBFm \u0111\u1EC1u \u0111\u1EB7n quanh n\u0103m (Evergreen Content)." }
  ];
  const publishWindows = regionCode === "VN" ? ["11:30 - 13:00 (Khung gi\u1EDD ngh\u1EC9 tr\u01B0a)", "19:30 - 21:30 (Gi\u1EDD v\xE0ng gi\u1EA3i tr\xED bu\u1ED5i t\u1ED1i)", "09:00 - 11:00 S\xE1ng Th\u1EE9 B\u1EA3y & Ch\u1EE7 Nh\u1EADt"] : ["16:00 - 18:00 EST", "11:00 - 13:00 EST (Th\u1EE9 N\u0103m \u0111\u1EBFn Ch\u1EE7 Nh\u1EADt)"];
  return {
    keyword,
    regionCode,
    countryName: country.name,
    dataSource,
    generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    scores: {
      opportunity: opportunityScore,
      demand: demandScore,
      competition: competitionScore,
      lowSupply: lowSupplyScore,
      monetization: monetizationScore,
      breakout: breakoutScore
    },
    monetizationDetails: {
      category: domainInfo.label,
      estimatedRPM: `${estimatedRpm} ${country.currency} / 1k views`,
      revenuePer100k: `${Math.round(estimatedRpm * 100).toLocaleString()} ${country.currency}`
    },
    verdict,
    contentGaps,
    publishWindows,
    competitors: processedVideos,
    stats: {
      totalAnalyzed: processedVideos.length,
      averageViews: avgViews,
      breakoutVideosCount: breakoutCount,
      smallChannelsCount: smallChannelCount
    }
  };
}
__name(performNicheAnalysis, "performNicheAnalysis");
async function fetchLiveYouTubeSearch(keyword, regionCode) {
  const country = COUNTRY_PROFILES[regionCode] || COUNTRY_PROFILES.VN;
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(keyword)}&hl=${country.lang}&gl=${country.gl}`;
  const res = await fetch(searchUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      "Accept-Language": `${country.lang}-${country.gl},${country.lang};q=0.9,en;q=0.8`
    }
  });
  if (!res.ok) {
    throw new Error(`YouTube Search failed with HTTP status ${res.status}`);
  }
  const html = await res.text();
  const match = html.match(/ytInitialData\s*=\s*({.+?});<\/script>/);
  if (!match) {
    throw new Error("Kh\xF4ng th\u1EC3 tr\xEDch xu\u1EA5t d\u1EEF li\u1EC7u YouTube th\u1EDDi gian th\u1EF1c. H\xE3y th\u1EED l\u1EA1i sau v\xE0i gi\xE2y.");
  }
  const initialData = JSON.parse(match[1]);
  const rawVideos = [];
  function walk(obj) {
    if (!obj || typeof obj !== "object") return;
    if (obj.videoRenderer) {
      const v = obj.videoRenderer;
      if (v.videoId && v.title?.runs?.[0]?.text) {
        rawVideos.push(v);
      }
      return;
    }
    for (const key of Object.keys(obj)) {
      walk(obj[key]);
    }
  }
  __name(walk, "walk");
  walk(initialData);
  if (rawVideos.length === 0) {
    throw new Error(`Kh\xF4ng t\xECm th\u1EA5y video n\xE0o cho t\u1EEB kh\xF3a: "${keyword}" t\u1EA1i th\u1ECB tr\u01B0\u1EDDng ${country.name}`);
  }
  const list = rawVideos.slice(0, 25).map((v) => {
    const vidId = v.videoId;
    const title2 = v.title?.runs?.[0]?.text || "";
    const channelTitle = v.ownerText?.runs?.[0]?.text || "YouTube Creator";
    const channelUrl = v.ownerText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.canonicalBaseUrl || "";
    const channelId = v.ownerText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId || "";
    const viewsRaw = v.viewCountText?.simpleText || "";
    const views = parseViewsText(viewsRaw);
    const pubRaw = v.publishedTimeText?.simpleText || "";
    const ageDays = parsePublishedText(pubRaw);
    const publishedAt = new Date(Date.now() - ageDays * 24 * 3600 * 1e3).toISOString();
    const thumbUrl = v.thumbnail?.thumbnails?.slice(-1)[0]?.url || `https://i.ytimg.com/vi/${vidId}/hqdefault.jpg`;
    const isVerified = (v.ownerBadges || []).some((b) => (b.metadataBadgeRenderer?.style || "").includes("VERIFIED"));
    let estimatedSubs = 15e3;
    if (isVerified) {
      estimatedSubs = Math.max(12e4, Math.round(views * 1.5));
    } else if (views > 5e5) {
      estimatedSubs = Math.round(views * 0.4);
    } else if (views > 1e5) {
      estimatedSubs = Math.round(views * 0.3);
    } else if (views > 2e4) {
      estimatedSubs = Math.round(views * 0.5);
    } else {
      estimatedSubs = Math.max(2500, Math.round(views * 0.8));
    }
    return {
      id: vidId,
      title: title2,
      channelTitle,
      channelId: channelId || channelUrl,
      publishedAt,
      ageDays,
      publishedText: pubRaw,
      views: views || 1e3,
      subscribers: estimatedSubs,
      thumbnail: thumbUrl,
      url: `https://www.youtube.com/watch?v=${vidId}`
    };
  });
  return list;
}
__name(fetchLiveYouTubeSearch, "fetchLiveYouTubeSearch");
async function fetchYouTubeDataViaAPI(keyword, regionCode, apiKey) {
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(keyword)}&type=video&maxResults=25&regionCode=${regionCode}&order=relevance&key=${apiKey}`;
  const res = await fetch(searchUrl);
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`YouTube API Error (${res.status}): ${errText}`);
  }
  const data = await res.json();
  const items = data.items || [];
  if (items.length === 0) return [];
  const videoIds = items.map((it) => it.id.videoId).filter(Boolean);
  const channelIds = [...new Set(items.map((it) => it.snippet.channelId).filter(Boolean))];
  const videoDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet,contentDetails&id=${videoIds.join(",")}&key=${apiKey}`;
  const videoRes = await fetch(videoDetailsUrl);
  const videoData = await videoRes.json();
  const videoMap = {};
  for (const v of videoData.items || []) {
    videoMap[v.id] = v;
  }
  const channelDetailsUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelIds.slice(0, 50).join(",")}&key=${apiKey}`;
  const channelRes = await fetch(channelDetailsUrl);
  const channelData = await channelRes.json();
  const channelSubMap = {};
  for (const c of channelData.items || []) {
    channelSubMap[c.id] = parseInt(c.statistics?.subscriberCount || "0", 10);
  }
  const now = Date.now();
  return items.map((item) => {
    const vid = item.id.videoId;
    const vDetail = videoMap[vid] || {};
    const stats = vDetail.statistics || {};
    const snippet = item.snippet;
    const chId = snippet.channelId;
    const views = parseInt(stats.viewCount || "0", 10);
    const subs = channelSubMap[chId] || 15e3;
    const pubDate = new Date(snippet.publishedAt).getTime();
    const ageDays = Math.max((now - pubDate) / (1e3 * 3600 * 24), 0.1);
    return {
      id: vid,
      title: snippet.title,
      channelTitle: snippet.channelTitle,
      channelId: chId,
      publishedAt: snippet.publishedAt,
      ageDays: Math.round(ageDays),
      publishedText: `${Math.round(ageDays)} ng\xE0y tr\u01B0\u1EDBc`,
      views,
      subscribers: subs,
      thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url,
      url: `https://www.youtube.com/watch?v=${vid}`
    };
  });
}
__name(fetchYouTubeDataViaAPI, "fetchYouTubeDataViaAPI");
async function handleHistory(request, env2) {
  if (!env2.DB) {
    return new Response(JSON.stringify([]), { headers: { "Content-Type": "application/json" } });
  }
  try {
    const { results } = await env2.DB.prepare(
      "SELECT id, keyword, region_code, opportunity_score, verdict, created_at FROM niche_searches ORDER BY created_at DESC LIMIT 20"
    ).all();
    return new Response(JSON.stringify(results || []), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return jsonError(err.message, 500);
  }
}
__name(handleHistory, "handleHistory");
async function handleExportCSV(url, env2) {
  const keyword = url.searchParams.get("keyword") || "";
  const regionCode = url.searchParams.get("regionCode") || "VN";
  if (!keyword) {
    return new Response("Missing keyword", { status: 400 });
  }
  let videos = [];
  if (env2.DB) {
    const search = await env2.DB.prepare(
      "SELECT id FROM niche_searches WHERE keyword = ? AND region_code = ? ORDER BY created_at DESC LIMIT 1"
    ).bind(keyword, regionCode).first();
    if (search) {
      const { results } = await env2.DB.prepare(
        "SELECT * FROM competitor_videos WHERE search_id = ? ORDER BY outlier_multiplier DESC"
      ).bind(search.id).all();
      videos = results || [];
    }
  }
  if (videos.length === 0) {
    const analysis = await performNicheAnalysis(keyword, regionCode, env2.YOUTUBE_API_KEY || "");
    videos = analysis.competitors;
  }
  const headers = ["Ti\xEAu \u0111\u1EC1 Video", "K\xEAnh", "L\u01B0\u1EE3t xem (Views)", "L\u01B0\u1EE3ng Sub K\xEAnh", "\u0110i\u1EC3m \u0110\u1ED9t Bi\u1EBFn (Outlier)", "T\u1ED1c \u0111\u1ED9 xem (VPH)", "C\xF4ng th\u1EE9c Th\u1EAFng (Pattern)", "Ng\xE0y \u0111\u0103ng", "Link Video"];
  const rows = videos.map((v) => [
    `"${(v.title || "").replace(/"/g, '""')}"`,
    `"${(v.channel_title || v.channelTitle || "").replace(/"/g, '""')}"`,
    v.view_count || v.views || 0,
    v.subscriber_count || v.subscribers || 0,
    v.outlier_multiplier || v.outlierMultiplier || 0,
    v.vph || 0,
    `"${(v.winning_pattern || v.pattern?.pattern || "").replace(/"/g, '""')}"`,
    v.published_at || v.publishedAt || "",
    v.video_url || v.url || ""
  ]);
  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
  return new Response(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="competitor_formula_${encodeURIComponent(keyword)}_${regionCode}.csv"`
    }
  });
}
__name(handleExportCSV, "handleExportCSV");
async function handleExportStrategy(url, env2) {
  const keyword = url.searchParams.get("keyword") || "";
  const regionCode = url.searchParams.get("regionCode") || "VN";
  const analysis = await performNicheAnalysis(keyword, regionCode, env2.YOUTUBE_API_KEY || "");
  const md = `# B\xC1O C\xC1O PH\xC2N T\xCDCH CHI\u1EBEN L\u01AF\u1EE2C NG\xC1CH YOUTUBE: "${analysis.keyword.toUpperCase()}"
**Qu\u1ED1c gia m\u1EE5c ti\xEAu:** ${analysis.countryName} (${analysis.regionCode})  
**Ngu\u1ED3n d\u1EEF li\u1EC7u:** ${analysis.dataSource === "LIVE_YOUTUBE_API" ? "YouTube Data API v3" : "YouTube Live Realtime Search"}  
**Th\u1EDDi gian l\u1EADp b\xE1o c\xE1o:** ${(/* @__PURE__ */ new Date()).toLocaleString("vi-VN")}  
**\u0110\xE1nh gi\xE1 t\u1ED5ng quan:** ${analysis.verdict.badge} \u2014 ${analysis.verdict.title}

---

## 1. B\u1EA2NG \u0110I\u1EC2M CH\u1EC8 S\u1ED0 C\u01A0 H\u1ED8I (OPPORTUNITY SCORECARD)

| Ch\u1EC9 s\u1ED1 | \u0110i\u1EC3m s\u1ED1 (0 - 100) | \u0110\xE1nh gi\xE1 & B\u1ED1i c\u1EA3nh |
|---|:---:|---|
| **\u0110i\u1EC3m C\u01A1 H\u1ED9i T\u1ED5ng Th\u1EC3** | **${analysis.scores.opportunity}/100** | ${analysis.verdict.summary} |
| **Nhu C\u1EA7u Kh\xE1n Gi\u1EA3 (Demand)** | **${analysis.scores.demand}/100** | L\u01B0\u1EE3t xem trung b\xECnh top video: ${analysis.stats.averageViews.toLocaleString()} views. |
| **\u0110\u1ED9 C\u1EA1nh Tranh (Competition)** | **${analysis.scores.competition}/100** | ${analysis.scores.competition > 70 ? "C\xE1c k\xEAnh l\u1EDBn chi\u1EBFm \u01B0u th\u1EBF, c\u1EA7n khai th\xE1c g\xF3c ng\xE1ch \u0111\u1ED9c l\u1EA1." : "C\u1EA1nh tranh v\u1EEBa ph\u1EA3i, c\xF3 nhi\u1EC1u kho\u1EA3ng tr\u1ED1ng cho k\xEAnh m\u1EDBi."} |
| **C\u01A1 H\u1ED9i Cho K\xEAnh Nh\u1ECF (Breakout)** | **${analysis.scores.breakout}/100** | Ph\xE1t hi\u1EC7n ${analysis.stats.breakoutVideosCount} video outlier (view cao v\u01B0\u1EE3t tr\u1ED9i so v\u1EDBi l\u01B0\u1EE3ng sub). |
| **Ti\u1EC1m N\u0103ng Ki\u1EBFm Ti\u1EC1n (RPM)** | **${analysis.scores.monetization}/100** | Ng\xE1ch: **${analysis.monetizationDetails.category}**. \u01AF\u1EDBc t\xEDnh RPM: ~${analysis.monetizationDetails.estimatedRPM}. |

---

## 2. KHO\u1EA2NG TR\u1ED0NG N\u1ED8I DUNG N\xCAN L\xC0M NGAY (CONTENT GAPS)

${analysis.contentGaps.map((g, i) => `### ${i + 1}. ${g.topic}
- **M\u1EE9c \u0111\u1ED9 \u01B0u ti\xEAn:** ${g.potential}
- **L\xFD do & Insight:** ${g.reason}
`).join("\n")}

---

## 3. KHUNG GI\u1EDC V\xC0NG \u0110\u0102NG B\xC0I \u0110\u01AF\u1EE2C \u0110\u1EC0 XU\u1EA4T
${analysis.publishWindows.map((w) => `- ${w}`).join("\n")}

---

## 4. TOP VIDEO \u0110\u1ED0I TH\u1EE6 C\xD3 C\xD4NG TH\u1EE8C TH\u1EAENG T\u1ED0T NH\u1EA4T (SWIPE FILE)

${analysis.competitors.slice(0, 10).map((v, i) => `### #${i + 1} [${v.title}](${v.url})
- **K\xEAnh:** ${v.channelTitle} (~${v.subscribers.toLocaleString()} subs)
- **L\u01B0\u1EE3t xem:** ${v.views.toLocaleString()} views | **T\u1ED1c \u0111\u1ED9:** ~${v.vph} views/gi\u1EDD
- **\u0110i\u1EC3m \u0110\u1ED9t Bi\u1EBFn (Outlier Multiplier):** **${v.outlierMultiplier}x** (L\u01B0\u1EE3t view g\u1EA5p ${v.outlierMultiplier} l\u1EA7n l\u01B0\u1EE3ng sub!)
- **C\xF4ng th\u1EE9c \xE1p d\u1EE5ng:** ${v.pattern.pattern} \u2014 ${v.pattern.why}
`).join("\n")}

---
*B\xE1o c\xE1o \u0111\u01B0\u1EE3c tr\xEDch xu\u1EA5t t\u1EF1 \u0111\u1ED9ng t\u1EEB H\u1EC7 th\u1ED1ng YouTube Niche & Competitor Intelligence (Cloudflare Workers & D1).*
`;
  return new Response(md, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="strategy_report_${encodeURIComponent(keyword)}_${regionCode}.md"`
    }
  });
}
__name(handleExportStrategy, "handleExportStrategy");
function jsonError(message, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
__name(jsonError, "jsonError");

// ../../../Users/quan/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../Users/quan/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError2 = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } catch (e) {
    const error3 = reduceError(e);
    const body = JSON.stringify(error3);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError2;

// .wrangler/tmp/bundle-Uh7Ubc/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// ../../../Users/quan/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env2, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env2, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env2, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env2, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-Uh7Ubc/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env2, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env2, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env2, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env2, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env2, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env2, ctx) => {
      this.env = env2;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map

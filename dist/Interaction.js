"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Interaction;
var _react = _interopRequireWildcard(require("react"));
var _reactRouterDom = require("react-router-dom");
var _antd = require("antd");
var _icons = require("@ant-design/icons");
var _componentFeedbackTool = _interopRequireDefault(require("@ivoyant/component-feedback-tool"));
require("react-quill/dist/quill.snow.css");
var _moment = _interopRequireDefault(require("moment"));
var _componentCache = require("@ivoyant/component-cache");
var _componentMessageBus = require("@ivoyant/component-message-bus");
var _InteractionModal = _interopRequireDefault(require("./InteractionModal"));
var _utils = require("./utils");
require("./styles.css");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const {
  Paragraph
} = _antd.Typography;
const {
  confirm
} = _antd.Modal;
const CALL_END_EVENT = 'SESSION.CALL.END'; // for handling the call end event trigerred by ctihandler.js file from web sockets

function Interaction(props) {
  const history = (0, _reactRouterDom.useHistory)();
  const {
    properties,
    interactionTags,
    defaultInteractionData,
    feedbackInfo
  } = props;
  const interactionState = _componentCache.cache.get('interaction');
  const {
    interactionId = '',
    ctn = '',
    ban = '',
    agentId = '',
    uniphoreSessionId,
    language
  } = interactionState || {};
  const initialInteractionState = {
    title: 'No Category ',
    content: 'Content of Tab 1',
    key: 'newTab ' + 1,
    saved: false,
    subject: '',
    category: defaultInteractionData?.category || 'Select Category',
    subCategoryOne: defaultInteractionData?.subCategory1 || 'Select Category 1',
    subCategoryTwo: defaultInteractionData?.subCategory2 || 'Select Category 2',
    descriptionText: '',
    descriptionHTML: '',
    saveInteractionError: '',
    submitInteractionError: '',
    finalStep: false,
    linkCaseData: [],
    linkCaseId: null,
    errorLinkCase: false,
    interactionTags: [],
    autoSubmit: false
  };
  const getNewPaneState = interactionState => {
    const newPaneState = {
      ...initialInteractionState,
      startTime: _moment.default.tz((0, _moment.default)().format(), 'America/New_York').format('hh:mm:ss a'),
      ...(interactionState?.authenticated === false && interactionState?.unauthenticatedCaller ? interactionState.unauthenticatedCaller : {})
    };
    return newPaneState;
  };

  // Added cache data to save the state while switching to pages.
  const [tabCount, setTabCount] = (0, _react.useState)(1);
  const uniphoreCacheData = _componentCache.cache.get('uniphoreData');
  const [uniphoreData, setUniphoreData] = (0, _react.useState)(uniphoreCacheData !== undefined ? uniphoreCacheData : {
    category: defaultInteractionData?.category || 'Select Category',
    subCategory1: defaultInteractionData?.subCategory1 || 'Select Category 1',
    subCategory2: defaultInteractionData?.subCategory2 || 'Select Category 2'
  });
  const [uniphoreError, setUniphoreError] = (0, _react.useState)('');
  const [uniErr, setUniErr] = (0, _react.useState)(false);
  const [isSaveVisible, setIsSaveVisible] = (0, _react.useState)(_componentCache.cache.get(`saveVisible`) === "true" ? true : false);
  const uniPhoreEnabled = window[sessionStorage.tabId].COM_IVOYANT_VARS?.featureFlags?.uniphore && uniphoreSessionId && language !== 'Spanish';

  /* reset when push */
  // const uniPhoreEnabled = true;
  const [uniphored, setUniphored] = (0, _react.useState)(_componentCache.cache.get(`uniphored`) === "true" ? true : false);
  const [uniphorePreviewed, setUniphorePreviewed] = (0, _react.useState)(_componentCache.cache.get(`uniphorePreviewed`) === "true" ? true : false);
  const [submitButtonLoading, setSubmitButtonLoading] = (0, _react.useState)(false);
  const [uniphoreAcceptanceAlert, setUniphoreAcceptanceAlert] = (0, _react.useState)(undefined);
  const [interactionTitle, setInteractionTitle] = (0, _react.useState)(interactionState?.title ||
  /*#__PURE__*/
  // <div className="save-interaction-header">
  //     Interaction ID - IC6VXKM <CopyOutlined />
  // </div>
  _react.default.createElement("div", {
    className: "d-flex justify-content-between"
  }, /*#__PURE__*/_react.default.createElement(Paragraph, {
    style: {
      marginBottom: '0',
      display: 'flex'
    },
    copyable: {
      text: interactionId
    }
  }, /*#__PURE__*/_react.default.createElement("div", null, ' ', /*#__PURE__*/_react.default.createElement(_icons.AudioOutlined, {
    style: {
      color: '#52C41A'
    }
  }), " \xA0 Interaction ID : ", interactionId)), /*#__PURE__*/_react.default.createElement("span", {
    style: {
      paddingRight: '24px'
    }
  }, "CTN : ", _componentCache.cache.get('interaction')?.ctn)));
  const [clickCounter, setClickCounter] = (0, _react.useState)(0);
  const [submitInteractionError, setSubmitInteractionError] = (0, _react.useState)(interactionState?.submitInteractionError || '');
  const [activeKey, setActiveKey] = (0, _react.useState)(interactionState?.activeKey || 'newTab 1');
  const [saveManualIteractionButtonLoading, setSaveManualIteractionButtonLoading] = (0, _react.useState)(false);
  const [panes, setPanes] = (0, _react.useState)(Object.keys(interactionState?.interactions || []).length > 0 ? Object.values(interactionState.interactions) : [getNewPaneState(interactionState)]);
  const updateTitle = newTitle => {
    const currentInteractionState = _componentCache.cache.get('interaction');
    if (currentInteractionState) {
      currentInteractionState.title = newTitle;
      _componentCache.cache.put('interaction', currentInteractionState);
    }
    setInteractionTitle(newTitle);
  };
  const updateActiveKey = newActiveKey => {
    const currentInteractionState = _componentCache.cache.get('interaction');
    if (currentInteractionState) {
      currentInteractionState.activeKey = newActiveKey;
      _componentCache.cache.put('interaction', currentInteractionState);
    }
    setActiveKey(newActiveKey);
  };
  const updatePanes = newPanes => {
    const currentInteractionState = _componentCache.cache.get('interaction');
    if (currentInteractionState) {
      currentInteractionState.interactions = {};
      newPanes.forEach(p => currentInteractionState.interactions[p.key] = p);
      _componentCache.cache.put('interaction', currentInteractionState);
    }
    setPanes(newPanes);
  };
  const updatePane = (paneKey, pane) => {
    const currentInteractionState = _componentCache.cache.get('interaction');
    if (paneKey && pane && currentInteractionState) {
      currentInteractionState.interactions[paneKey] = pane;
      _componentCache.cache.put('interaction', currentInteractionState);
      setPanes(Object.values(currentInteractionState.interactions));
    }
  };
  const {
    properties: {
      visible,
      showMultipleTabs,
      datasources,
      submitInteractionWorkflow,
      uniphoreWorkflow,
      feedbackWorkflow
    }
  } = props;
  const resetAll = () => {
    setPanes([getNewPaneState(_componentCache.cache.get('interaction'))]);
  };
  const updateVisibility = (event, type, payload) => {
    if (uniPhoreEnabled) {
      if (payload?.body?.uniphoreSessionId) {
        interactionState.uniphoreSessionId = payload.body.uniphoreSessionId;
      }
      getUniphoreInteraction(interactionState?.uniphoreSessionId);
    }
  };
  (0, _react.useEffect)(() => {
    _componentMessageBus.MessageBus.subscribe(CALL_END_EVENT, CALL_END_EVENT, updateVisibility);
    _componentMessageBus.MessageBus.subscribe('saveInteraction.'.concat(props.events.interactionStart), props.events.interactionStart, resetAll, {});
    return () => {
      _componentMessageBus.MessageBus.unsubscribe('saveInteraction.'.concat(props.events.interactionStart));
      _componentMessageBus.MessageBus.unsubscribe(CALL_END_EVENT);
    };
  }, []);
  const handleUniphoreData = function (successStates, errorStates) {
    let isPreview = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    return (subscriptionId, topic, eventData, closure) => {
      const isSuccess = successStates.includes(eventData.value);
      const isError = errorStates.includes(eventData.value);
      if (isSuccess || isError) {
        if (isSuccess && eventData?.event?.data?.data) {
          const unidata = eventData.event.data.data;

          // ONLY LAST 4 DIGITS OF CTN SHOULD BE DISPLAYED
          const filteredSummary = unidata?.uniphoreSummary?.map(us => {
            if (us.label === 'CTN') {
              const ctnBody = us.body[0];
              return {
                label: us.label,
                body: [ctnBody?.slice(ctnBody?.length - 4)]
              };
            }
            return us;
          });
          const data = {
            ...unidata,
            uniphoreSummary: filteredSummary
          };
          data['uniphoreDataAccurate'] = data['uniphoreDataAccurate'] ? data['uniphoreDataAccurate'] : _utils.UNIPHORE_ACCURACY?.YES;
          // : true;
          _componentCache.cache.put('uniphoreData', data);
          setUniphoreData(data);
          setUniErr(false);
          setIsSaveVisible(true);
          if (!isPreview) {
            setIsSaveVisible(true);
            _componentCache.cache.put(`saveVisible`, "true");
          } else if (isPreview) {
            setUniphorePreviewed(true);
            _componentCache.cache.put(`uniphorePreviewed`, "true");
          }
        }
        if (isError) {
          setUniphoreError(eventData?.event?.data?.message || 'Uniphore is currently down. Please fill out the interaction form!');
          setUniErr(true);
        }
        setSaveManualIteractionButtonLoading(false);
        if (!isPreview) {
          setUniphored(true);
          _componentCache.cache.put(`uniphored`, "true");
        }
        _componentMessageBus.MessageBus.unsubscribe(subscriptionId);
      }
    };
  };
  (0, _react.useEffect)(() => {
    if (panes[0].category === 'Select Category' || panes[0].category === defaultInteractionData?.category) {
      updateCategory(uniphoreData);
    }
    if (panes[0].subCategoryOne === 'Select Category 1' || panes[0].subCategoryOne === defaultInteractionData?.subCategory1) {
      updateSubCategoryOne(uniphoreData);
    }
    if (panes[0].subCategoryTwo === 'Select Category 2' || panes[0].subCategoryTwo === defaultInteractionData?.subCategory2) {
      updateSubCategoryTwo(uniphoreData);
    }
  }, [uniphoreData]);
  const updateCategory = function (data) {
    let tabIndex = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : panes[0].key;
    let panesCopy = panes.slice();
    let paneIndex = panesCopy.findIndex(pane => pane.key === tabIndex);
    panesCopy[paneIndex].category = data.category;
    updatePanes(panesCopy);
  };
  const updateSubCategoryOne = function (data) {
    let tabIndex = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : panes[0].key;
    let panesCopy = panes.slice();
    let paneIndex = panesCopy.findIndex(pane => pane.key === tabIndex);
    panesCopy[paneIndex].subCategoryOne = data.subCategory1;
    updatePanes(panesCopy);
  };
  const updateSubCategoryTwo = function (data) {
    let tabIndex = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : panes[0].key;
    let panesCopy = panes.slice();
    let paneIndex = panesCopy.findIndex(pane => pane.key === tabIndex);
    panesCopy[paneIndex].subCategoryTwo = data.subCategory2;
    updatePanes(panesCopy);
  };
  const getUniphoreInteraction = (sessionId, isPreview) => {
    const {
      workflow,
      datasource,
      responseMapping,
      successStates,
      errorStates
    } = uniphoreWorkflow;
    setSaveManualIteractionButtonLoading(true);
    const registrationId = workflow.concat('.').concat(ban);
    _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
      header: {
        registrationId: registrationId,
        workflow: workflow,
        eventType: 'INIT'
      }
    });
    _componentMessageBus.MessageBus.subscribe(registrationId, 'WF.'.concat(workflow).concat('.STATE.CHANGE'), handleUniphoreData(successStates, errorStates, isPreview));
    _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.SUBMIT'), {
      header: {
        registrationId: registrationId,
        workflow: workflow,
        eventType: 'SUBMIT'
      },
      body: {
        datasource: datasources[datasource],
        request: {
          params: {
            sessionId: sessionId || uniphoreSessionId,
            dataselector: 'all'
          }
        },
        responseMapping
      }
    });
  };
  const handleResponse = (successStates, errorStates) => (subscriptionId, topic, eventData, closure) => {
    const state = eventData.value;
    const isSuccess = successStates.includes(state);
    const isFailure = errorStates.includes(state);
    if (isSuccess || isFailure) {
      if (isSuccess) {
        resetModal();
        window[sessionStorage.tabId].conversationId = window[sessionStorage.tabId]?.sessionConversationId;
        if (sessionStorage.getItem('ghostCall') === 'true') {
          _antd.notification['success']({
            message: 'Success!',
            description: 'Ghost caller interaction succesfully submitted!'
          });
          sessionStorage.setItem('ghostCall', false);
        }
        if (uniPhoreEnabled) {
          setUniphoreAcceptanceAlert(false);
        }
      }
      if (isFailure) {
        setSubmitInteractionError(eventData.event.data.message);
        if (uniPhoreEnabled) {
          setUniphoreAcceptanceAlert(true);
        }
      }
      setSubmitButtonLoading(false);
      _componentMessageBus.MessageBus.unsubscribe(subscriptionId);
    }
  };
  const handleSubmitInteraction = () => {
    const {
      workflow,
      datasource,
      successStates,
      errorStates,
      responseMapping
    } = submitInteractionWorkflow;
    const interactionState = _componentCache.cache.get('interaction');
    const {
      interactionId = '',
      ctn = '',
      ban = '',
      agentId = '',
      channel = interactionChannel[0]
    } = interactionState || {};
    const submitInteractionObject = {
      interactionId: interactionId
    };
    if (window[window.sessionStorage?.tabId].timerSeconds) {
      submitInteractionObject.customerCallEndTime = (0, _moment.default)(interactionState?.startTime).add(window[window.sessionStorage?.tabId].timerSeconds, 'seconds').format('YYYY-MM-DD HH:mm:ssZZ');
    }
    setSubmitButtonLoading(true);
    const submitEvent = 'SUBMIT';
    _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
      header: {
        registrationId: workflow,
        workflow,
        eventType: 'INIT'
      }
    });
    _componentMessageBus.MessageBus.subscribe(workflow, 'WF.'.concat(workflow).concat('.STATE.CHANGE'), handleResponse(successStates, errorStates));
    _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.').concat(submitEvent), {
      header: {
        registrationId: workflow,
        workflow,
        eventType: submitEvent
      },
      body: {
        datasource: datasources[datasource],
        request: {
          body: submitInteractionObject
        },
        responseMapping
      }
    });
  };
  const resetInteractionTitle = () => updateTitle( /*#__PURE__*/_react.default.createElement("div", {
    className: "d-flex justify-content-between"
  }, /*#__PURE__*/_react.default.createElement(Paragraph, {
    style: {
      marginBottom: '0',
      display: 'flex'
    },
    copyable: {
      text: interactionId
    }
  }, /*#__PURE__*/_react.default.createElement("div", null, ' ', /*#__PURE__*/_react.default.createElement(_icons.AudioOutlined, {
    style: {
      color: '#52C41A'
    }
  }), " \xA0 Interaction ID : ", interactionId)), /*#__PURE__*/_react.default.createElement("span", {
    style: {
      paddingRight: '24px'
    }
  }, "CTN : ", _componentCache.cache.get('interaction')?.ctn)));
  const onChange = newActiveKey => {
    updateActiveKey(newActiveKey);
  };
  const remove = targetKey => {
    let activeKeyCopy = activeKey;
    let lastIndex;
    panes.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const panesCopy = panes.slice().filter(pane => pane.key !== targetKey);
    if (panesCopy.length && activeKey === targetKey) {
      if (lastIndex >= 0) {
        activeKeyCopy = panesCopy[lastIndex].key;
      } else {
        activeKeyCopy = panesCopy[0].key;
      }
    }
    updatePanes(panesCopy);
    updateActiveKey(activeKeyCopy);
  };
  const minimizeModal = () => {
    props.setSaveInteractionModalVisible(false);
  };
  function changeTitle() {
    updateTitle( /*#__PURE__*/_react.default.createElement(_antd.Row, null, /*#__PURE__*/_react.default.createElement(_antd.Col, {
      xs: 2
    }, /*#__PURE__*/_react.default.createElement(_icons.CheckCircleOutlined, {
      style: {
        fontSize: '35px',
        height: '50px',
        width: '50px',
        color: '#52C41A'
      }
    })), /*#__PURE__*/_react.default.createElement(_antd.Col, {
      xs: 21
    }, /*#__PURE__*/_react.default.createElement(_antd.Row, null, /*#__PURE__*/_react.default.createElement(_antd.Col, {
      xs: 24,
      className: "title-heading-first-line"
    }, /*#__PURE__*/_react.default.createElement(Paragraph, {
      style: {
        marginBottom: '0',
        display: 'flex'
      },
      copyable: {
        text: interactionId
      }
    }, /*#__PURE__*/_react.default.createElement("div", null, "Interaction ID : ", interactionId))), /*#__PURE__*/_react.default.createElement(_antd.Col, {
      xs: 24,
      className: "title-heading-text"
    }, "Interaction has successfully saved. Now you can create a case or submit to interaction history.", ' ')))));
  }
  const resetModal = () => {
    if (!_componentCache.cache.get('contact')) {
      _componentCache.cache.remove('interaction');
    }
    props.setSaveInteractionModalVisible(false);
    resetInteractionTitle();
    setSubmitInteractionError('');
    setActiveKey('newTab 1');
    setPanes([]);
    if (_componentCache.cache.get('contact')) {
      _componentMessageBus.MessageBus.send('SAVE.DISPLAY.INTERACTION');
    } else {
      window[window.sessionStorage?.tabId].dispatchRedux('DATA_REQUEST', {
        dashboardID: 'history-board',
        datasources: ['360-interaction-history']
      });
    }
    if (props.events && props.events.interactionSubmitted) {
      _componentMessageBus.MessageBus.send(props.events.interactionSubmitted, {
        header: {
          source: 'interaction',
          event: props.events.interactionSubmitted
        },
        body: {
          message: 'Interaction '.concat(interactionId).concat(' has been submitted.')
        }
      });
    }
    if (!_componentCache.cache.get('contact')) setTimeout(function () {
      history.push('/dashboards/history-board#interactionhistory');
    }, 2000);
    if (_componentCache.cache.get('contact')) _componentCache.cache.remove('contact');
    if (_componentCache.cache.get('ctn')) _componentCache.cache.remove('ctn');
  };
  const changeTabTitle = (tabIndex, title) => {
    let panesCopy = panes.slice();
    let paneIndex = panesCopy.findIndex(pane => pane.key === tabIndex);
    panesCopy[paneIndex].title = title;
    updatePanes(panesCopy);
  };
  const updateSaved = tabIndex => {
    let panesCopy = panes.slice();
    let paneIndex = panesCopy.findIndex(pane => pane.key === tabIndex);
    panesCopy[paneIndex].saved = true;
    updatePanes(panesCopy);
  };
  const add = () => {
    const activeKeyNewTab = `newTab ${tabCount + 1}`;
    const newPanes = [...panes];
    const newPane = getNewPaneState(interactionState);
    newPane.key = activeKeyNewTab;
    newPanes.push(newPane);
    updatePanes(newPanes);
    updateActiveKey(activeKeyNewTab);
    setTabCount(tabCount + 1);
  };
  const onEdit = (targetKey, action) => {
    let paneIndex = panes.findIndex(pane => pane.key === targetKey);
    if (action === 'add') add();else if (action === 'remove') {
      if (!panes[paneIndex].saved) {
        confirm({
          okText: 'Confirm',
          icon: /*#__PURE__*/_react.default.createElement(_icons.ExclamationCircleOutlined, null),
          content: 'This action is not saved yet. Do you still want to close this ?',
          onOk() {
            remove(targetKey);
          },
          onCancel() {
            console.log('Cancel');
          }
        });
      } else remove(targetKey);
    }
  };
  function modalFooter() {
    let footer = [];
    let submitButton = /*#__PURE__*/_react.default.createElement(_antd.Button, {
      className: "save-interaction-btn",
      type: "primary",
      loading: submitButtonLoading,
      onClick: handleSubmitInteraction
    }, "Submit Interaction");
    let closeButton = /*#__PURE__*/_react.default.createElement(_antd.Button, {
      style: {
        background: '#D9D9D9',
        borderRadius: '2px'
      },
      type: "default"
      // onClick={() => resetModal()} - Changed Close to Minimize
      ,
      onClick: () => minimizeModal()
    }, "Close");
    let reloadButton = /*#__PURE__*/_react.default.createElement(_antd.Button, {
      style: {
        background: '#D9D9D9',
        borderRadius: '2px',
        marginRight: '4px'
      },
      disabled: clickCounter > 1 ? true : false,
      type: clickCounter > 1 ? '' : 'primary',
      onClick: () => {
        getUniphoreInteraction(uniphoreSessionId);
        setClickCounter(clickCounter + 1);
      }
    }, "Retry");
    if (submitInteractionConditions()) {
      footer.push(submitButton);
      footer.push(closeButton);
      //footer.push(reloadButton);
    } else if (uniErr) {
      footer.push(reloadButton, closeButton);
    } else footer.push();
    // else footer.push(closeButton);

    return footer;
  }
  function submitInteractionConditions() {
    let conditionSatisfied = true;
    for (const pane of panes) {
      if (!pane.saved || !pane.finalStep) conditionSatisfied = false;
    }
    return conditionSatisfied;
  }
  const getIcon = saved => {
    return saved ? /*#__PURE__*/_react.default.createElement(_icons.CloseOutlined, null) : /*#__PURE__*/_react.default.createElement("div", {
      style: {
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        backgroundColor: '#f28c00'
      }
    });
  };
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_componentFeedbackTool.default, {
    feedbackWorkflow: feedbackWorkflow,
    datasources: datasources,
    feedbackInfo: feedbackInfo
  }), /*#__PURE__*/_react.default.createElement(_antd.Modal, {
    className: "save-interaction-modal",
    title: interactionTitle,
    open: visible,
    onCancel: () => {
      minimizeModal();
    },
    closeIcon: /*#__PURE__*/_react.default.createElement(_icons.MinusOutlined, null),
    width: uniPhoreEnabled ? 1200 : 750,
    footer: modalFooter(),
    forceRender: true,
    centered: true
  }, /*#__PURE__*/_react.default.createElement("div", null, panes.map(pane => /*#__PURE__*/_react.default.createElement("div", {
    //tab={pane.title}
    key: pane.key
    // closable={showMultipleTabs ? pane?.closable : false}
    // closeIcon={showMultipleTabs && getIcon(pane?.saved)}
  }, /*#__PURE__*/_react.default.createElement(_InteractionModal.default, _extends({}, props, {
    resetInteractionTitle: resetInteractionTitle,
    changeTitle: changeTitle,
    paneIndex: pane.key,
    changeTabTitle: changeTabTitle,
    updateSaved: updateSaved,
    paneState: pane,
    updatePaneState: updatePane,
    uniphoreData: uniphoreData,
    setUniphoreData: setUniphoreData,
    uniphoreError: uniphoreError,
    interactionTags: interactionTags,
    uniPhoreEnabled: uniPhoreEnabled,
    uniErr: uniErr,
    setUniErr: setUniErr,
    setIsSaveVisible: setIsSaveVisible,
    isSaveVisible: isSaveVisible,
    uniphored: uniphored,
    setUniphored: setUniphored,
    resetModal: resetModal,
    handleSubmitInteraction: handleSubmitInteraction,
    getUniphoreInteraction: getUniphoreInteraction,
    saveManualIteractionButtonLoading: saveManualIteractionButtonLoading,
    uniphoreAcceptanceAlert: uniphoreAcceptanceAlert,
    setUniphoreAcceptanceAlert: setUniphoreAcceptanceAlert,
    defaultInteractionData: defaultInteractionData,
    uniphoreSessionId: uniphoreSessionId,
    uniphorePreviewed: uniphorePreviewed
  }))))), submitInteractionError !== '' && /*#__PURE__*/_react.default.createElement("div", {
    className: "save-interaction-error",
    style: {
      paddingLeft: '24px'
    }
  }, submitInteractionError)));
}
module.exports = exports.default;
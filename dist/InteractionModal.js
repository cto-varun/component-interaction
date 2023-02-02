"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = InteractionModal;
var _react = _interopRequireWildcard(require("react"));
var _antd = require("antd");
require("react-quill/dist/quill.snow.css");
var _icons = require("@ant-design/icons");
var _shortid = _interopRequireDefault(require("shortid"));
var _moment = _interopRequireDefault(require("moment"));
var _componentNotes = _interopRequireDefault(require("@ivoyant/component-notes"));
var _componentMessageBus = require("@ivoyant/component-message-bus");
var _componentCache = require("@ivoyant/component-cache");
var _utils = require("./utils");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const {
  Text
} = _antd.Typography;
const INTERACTION_AUTO_SAVE_INITIATE = 'INTERACTION.AUTO.SAVE';
const linkCaseColumns = [{
  title: 'Case ID',
  dataIndex: 'caseId',
  key: 'caseId'
}, {
  title: 'Created At',
  dataIndex: 'createdAt',
  key: 'createdAt',
  render: value => {
    return new Date(value).toLocaleString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hourCycle: 'h12'
    });
  }
}, {
  title: 'Updated By',
  dataIndex: 'updatedBy',
  key: 'updatedBy',
  render: (text, data) => /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, data?.caseHistory[0]?.updatedBy)
}, {
  title: 'Category',
  dataIndex: 'category',
  key: 'category',
  render: (text, data) => /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, data?.caseHistory[0]?.category)
}];

// NORMAL TAGS SELECTOR
const {
  Option
} = _antd.Select;
function tagRender(props) {
  const {
    label,
    value,
    closable,
    onClose
  } = props;
  const onPreventMouseDown = event => {
    event.preventDefault();
    event.stopPropagation();
  };
  return /*#__PURE__*/_react.default.createElement(_antd.Tag, {
    color: "success",
    onMouseDown: onPreventMouseDown,
    closable: closable,
    onClose: onClose,
    style: {
      marginRight: 3
    }
  }, label);
}
function InteractionModal(props) {
  const {
    properties,
    store,
    component,
    messages,
    paneIndex,
    changeTabTitle,
    changeTitle,
    updateSaved,
    paneState,
    updatePaneState,
    resetInteractionTitle,
    uniphoreError,
    uniphoreData,
    setUniphoreData,
    interactionTags,
    uniPhoreEnabled,
    uniErr,
    isSaveVisible,
    setIsSaveVisible,
    uniphored,
    setUniphored,
    resetModal,
    handleSubmitInteraction,
    uniphoreSessionId,
    getUniphoreInteraction,
    uniphoreAcceptanceAlert,
    setUniphoreAcceptanceAlert,
    saveManualIteractionButtonLoading,
    uniphorePreviewed
  } = props;
  const UniSummary = uniphoreData?.uniphoreSummary?.map(_ref => {
    let {
      label,
      body
    } = _ref;
    return {
      label,
      body: body[0].split(',')
    };
  });
  const UniphoreIssueData = UniSummary?.find(us => us?.label === "Reason for Call");
  const UniphoreResolutionData = UniSummary?.find(us => us?.label === "Resolution");
  const UniphoreTroubleShootingData = UniSummary?.find(us => us?.label === "Recommendation or Troubleshooting step");
  const UniphoreCustomerName = UniSummary?.find(us => us?.label === "Customer Name");
  const UniphoreCTN = UniSummary?.find(us => us?.label === "CTN");
  const renderSummary = _ref2 => {
    let {
      label,
      body
    } = _ref2;
    let UniIcon;
    if (label === "Reason for Call") {
      UniIcon = /*#__PURE__*/_react.default.createElement(_icons.ExclamationCircleOutlined, {
        style: {
          fontSize: '24px',
          color: '#ff4d4f',
          marginRight: '8px'
        }
      });
    } else if (label === "Recommendation or Troubleshooting step") {
      UniIcon = /*#__PURE__*/_react.default.createElement(_icons.ToolOutlined, {
        style: {
          fontSize: '24px',
          color: '#52c41a',
          marginRight: '8px'
        }
      });
    } else if (label === "Resolution") {
      UniIcon = /*#__PURE__*/_react.default.createElement(_icons.ExclamationCircleOutlined, {
        style: {
          fontSize: '24px',
          color: '#52c41a',
          marginRight: '8px'
        }
      });
    }
    return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
      className: "uniphore-call-summary-label"
    }, UniIcon, /*#__PURE__*/_react.default.createElement("small", null, label)), /*#__PURE__*/_react.default.createElement("ul", null, label === "Reason for Call" || label === "Issue" ? body?.map((data, idx) => idx === 0 ? /*#__PURE__*/_react.default.createElement("li", {
      style: {
        fontWeight: '600'
      },
      key: idx
    }, " ", data) : /*#__PURE__*/_react.default.createElement("li", {
      key: idx
    }, " ", data)) : label === "CTN" ? body?.map((data, idx) => /*#__PURE__*/_react.default.createElement("li", {
      key: idx
    }, " ", data?.slice(data?.length - 4))) : body?.map((data, idx) => /*#__PURE__*/_react.default.createElement("li", {
      key: idx
    }, " ", data))));
  };
  const initialInteractionState = {
    category: 'Select Category',
    subCategoryOne: 'Select Category 1',
    subCategoryTwo: 'Select Category 2'
  };
  const normalIteractionTags = interactionTags.filter(_ref3 => {
    let {
      name
    } = _ref3;
    return name;
  }).map(item => /*#__PURE__*/_react.default.createElement(Option, {
    key: item.name,
    style: {
      marginBottom: '4px'
    }
  }, item.name));
  function handleInteractionTags(value) {
    handleUniphoreData('interactionTags', value); // TO-DO : REMOVE THIS IF NO USE
    updateInteraction({
      interactionTags: value
    });
  }
  const params = component?.params ? component.params : {};
  if (store?.response?.['save-interaction-options']) {
    Object.assign(properties, store?.response?.['save-interaction-options']);
  }
  if (params) {
    Object.assign(properties, params);
  }
  const {
    onConvertToCase,
    onAddToCase,
    options = {},
    interactionCategories,
    saveInteractionWorkflow,
    datasources,
    createPrivileges,
    linkCaseWorkflow
  } = properties;
  const {
    interactionChannel = ['Voice', 'Chat', 'Email']
  } = options;
  const interactionState = _componentCache.cache.get('interaction');
  const {
    interactionId = '',
    ctn = '',
    ban = '',
    agentId = '',
    channel = interactionChannel[0]
  } = interactionState || {};
  const [isEdit, setIsEdit] = (0, _react.useState)(!paneState.save);
  const [selectedRows, setSelectedRows] = (0, _react.useState)([]);
  const [interactionEndTime, setInteractionEndTime] = (0, _react.useState)();
  const [showNotes, setShowNotes] = (0, _react.useState)(_componentCache.cache.get(`showNotes`) === "true" ? true : false);
  const [redirectToIH, setRedirectToIH] = (0, _react.useState)(false);
  const [disableCategory, setDisableCategory] = (0, _react.useState)(true);
  const [isModalSaveManualInteractionVisible, setIsSaveManualInteractionModalVisible] = (0, _react.useState)(false);
  const [isShowSaveManualInteractionButton, setIsShowSaveManualInteractionButton] = (0, _react.useState)(true);
  const [chatId, setChatId] = (0, _react.useState)('');
  const [chatIdErrorMessage, setChatIdErrorMessage] = (0, _react.useState)('');
  const [showChatIdField, setShowChatIdField] = (0, _react.useState)(window[window.sessionStorage?.tabId][`Interaction_Source`] !== "Voice");
  const {
    workflow,
    datasource,
    successStates,
    errorStates,
    responseMapping
  } = saveInteractionWorkflow;
  const {
    workflow: linkWorkflow,
    datasource: linkCaseDatasource,
    successStates: linkCaseSuccessStates,
    errorStates: linkCaseErrorStates,
    responseMapping: linkCaseResponseMapping
  } = linkCaseWorkflow;
  const updateInteraction = props => {
    if (props) {
      const newState = {
        ...paneState,
        ...props
      };
      updatePaneState(paneIndex, newState);
    }
  };
  const handleResponse = (automaticSaveInitiated, agentOpted) => (subscriptionId, topic, eventData, closure) => {
    const state = eventData.value;
    const isSuccess = successStates.includes(state);
    const isFailure = errorStates.includes(state);
    if (isSuccess || isFailure) {
      if (isSuccess) {
        if (!automaticSaveInitiated && !agentOpted) {
          updateSaved(paneIndex);
          // added condition to make sure only go to final step if it is normal process without automatic save and agent has not opted to leave
          updateInteraction({
            finalStep: true,
            saveInteractionError: ''
          });
        }
        setRedirectToIH(true);
        changeTitle();
        if (window[window.sessionStorage?.tabId].createdCaseId) {
          delete window[window.sessionStorage?.tabId].createdCaseId;
        }
        if (sessionStorage.getItem('ghostCall') === 'true') {
          handleSubmitInteraction();
        }
      }
      if (isFailure) {
        updateInteraction({
          saveInteractionError: eventData.event.data.message
        });
      }
      _componentMessageBus.MessageBus.unsubscribe(subscriptionId);
    }
  };
  const handleToggleEdit = isEdit => {
    setIsEdit(prevValue => isEdit ?? !prevValue);
    //setShowNotes(true);
  };

  function handleLinkCaseResponse(subscriptionId, topic, eventData, closure) {
    const state = eventData.value;
    const isSuccess = linkCaseSuccessStates.includes(state);
    const isFailure = linkCaseErrorStates.includes(state);
    if (isSuccess || isFailure) {
      if (isSuccess) {
        let cases = eventData?.event?.data?.data?.slice() || [];
        if (cases) {
          updateInteraction({
            linkCaseData: cases,
            errorLinkCase: false
          });
        }
      }
      if (isFailure) {
        // setSaveInteractionError(eventData.event.data.message);
        updateInteraction({
          errorLinkCase: eventData?.event?.data?.message || 'Internal Server Error, Please try again later'
        });
      }
      _componentMessageBus.MessageBus.unsubscribe(subscriptionId);
    }
  }
  function handleLinkCase() {
    if (linkCaseCondition()) resetLinkCase();else {
      const submitEvent = 'SUBMIT';
      const linkDataSource = datasources[linkCaseDatasource];
      _componentMessageBus.MessageBus.send('WF.'.concat(linkWorkflow).concat('.INIT'), {
        header: {
          registrationId: linkWorkflow,
          workflow: linkWorkflow,
          eventType: 'INIT'
        }
      });
      _componentMessageBus.MessageBus.subscribe(linkWorkflow, 'WF.'.concat(linkWorkflow).concat('.STATE.CHANGE'), handleLinkCaseResponse);
      _componentMessageBus.MessageBus.send('WF.'.concat(linkWorkflow).concat('.').concat(submitEvent), {
        header: {
          registrationId: linkWorkflow,
          workflow: linkWorkflow,
          eventType: submitEvent
        },
        body: {
          datasource: linkDataSource,
          request: {
            body: {
              billingAccountNumber: ban
            }
          },
          responseMapping: linkCaseResponseMapping
        }
      });
    }
  }
  const getValueFromSession = key => sessionStorage.getItem(key) ? sessionStorage.getItem(key).includes('Select') ? 'NA' : sessionStorage.getItem(key) : '';
  const handleSaveInteraction = (uniphoreAccurateInteraction, automaticSaveInitiated, data, agentOpted) => {
    const {
      body = {}
    } = data || {};
    const {
      category = undefined,
      subCategory1 = undefined,
      subCategory2 = undefined,
      notes = undefined,
      ghostCall = false
    } = body;
    sessionStorage.setItem('ghostCall', ghostCall);
    const submitEvent = 'SUBMIT';
    const interactionState = _componentCache.cache.get('interaction');
    const {
      interactionId = '',
      ctn = '',
      ban = '',
      agentId = '',
      channel = interactionChannel[0]
    } = interactionState || {};
    const {
      attId = ''
    } = window[sessionStorage.tabId].COM_IVOYANT_VARS;
    let saveInteractionObject = {
      interactionId,
      category: paneState.category,
      subCategory1: paneState.subCategoryOne,
      subCategory2: paneState.subCategoryTwo,
      interactionMemo: paneState.subject,
      interactionSummary: paneState.descriptionHTML,
      caseId: paneState.linkCaseId,
      tags: paneState.interactionTags,
      uniphoreSummary: uniphoreData?.uniphoreSummary,
      uniphoreTags: uniphoreData?.uniphoreTags,
      uniphoreDataAccurate: paneState?.uniphoreDataAccurate,
      autoSubmit: paneState?.autoSubmit
    };
    if (!showChatIdField) {
      saveInteractionObject.interactionSource = "Voice";
    } else if (showChatIdField && chatId === '') {
      saveInteractionObject.interactionSource = "Manual";
    } else if (showChatIdField && chatId !== '') {
      saveInteractionObject.chatId = chatId;
      saveInteractionObject.interactionSource = "Chat";
    }
    const uniphoreCacheData = _componentCache.cache.get('uniphoreData');
    const uniphoreDataAccurateCache = _componentCache.cache.get('uniphoreDataAccurate');
    if (!saveInteractionObject['uniphoreSummary'] && uniphoreCacheData) saveInteractionObject['uniphoreSummary'] = uniphoreCacheData['uniphoreSummary'];
    if (!saveInteractionObject['uniphoreTags'] && uniphoreCacheData) saveInteractionObject['uniphoreTags'] = uniphoreCacheData['uniphoreTags'];
    if (!saveInteractionObject['uniphoreDataAccurate'] && uniphoreDataAccurateCache !== undefined) {
      saveInteractionObject['uniphoreDataAccurate'] = uniphoreDataAccurateCache;
    }
    if (interactionId !== '') {
      if (ghostCall) {
        saveInteractionObject['category'] = category;
        saveInteractionObject['subCategory1'] = subCategory1;
        saveInteractionObject['subCategory2'] = subCategory2;
        saveInteractionObject['interactionSummary'] = notes;
      } else if (automaticSaveInitiated || agentOpted) {
        // if user has opted to leave the page or accidently browswer is being closed or agent remained idle for time mentioned in variable in config.js file at line number 48 :- interactionIdleTimeout
        saveInteractionObject['category'] = getValueFromSession('category');
        saveInteractionObject['subCategory1'] = getValueFromSession('subCategory1');
        saveInteractionObject['subCategory2'] = getValueFromSession('subCategory2');
        if (automaticSaveInitiated) saveInteractionObject['interactionSummary'] = getValueFromSession('descriptionText') + (attId + ' :- Idle time reached 55 minutes. Automatic save initiated.');else saveInteractionObject['interactionSummary'] = getValueFromSession('descriptionText') !== '' ? getValueFromSession('descriptionText') : attId + ' agent opted to leave. Automatic save initiated.';
      }
      if (!paneState.linkCaseId) delete saveInteractionObject.linkCaseId;
      if (window[window.sessionStorage?.tabId].createdCaseId) {
        saveInteractionObject.caseId = window[window.sessionStorage?.tabId].createdCaseId;
      }
      if (window[window.sessionStorage?.tabId].timerSeconds && uniphoreAccurateInteraction) {
        saveInteractionObject.customerCallEndTime = (0, _moment.default)(interactionState?.startTime).add(window[window.sessionStorage?.tabId].timerSeconds, 'seconds').format('YYYY-MM-DD HH:mm:ssZZ');
      }
      _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
        header: {
          registrationId: workflow,
          workflow,
          eventType: 'INIT'
        }
      });
      _componentMessageBus.MessageBus.subscribe(workflow, 'WF.'.concat(workflow).concat('.STATE.CHANGE'), handleResponse(automaticSaveInitiated, agentOpted));
      _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.').concat(submitEvent), {
        header: {
          registrationId: workflow,
          workflow,
          eventType: submitEvent
        },
        body: {
          datasource: datasources[datasource],
          request: {
            body: saveInteractionObject
          },
          responseMapping
        }
      });
    }
  };

  // const handleConvertToCase = () => {
  //     if (onConvertToCase) onConvertToCase();
  // };

  // const handleAddToCase = () => {
  //     if (onAddToCase) onAddToCase();
  // };
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRows(selectedRowKeys);
      updateInteraction({
        linkCaseId: selectedRows[0]?.caseId
      });
    }
  };
  function handleUniphoreData(field, value) {
    const data = {
      ...uniphoreData,
      [field]: value
    };
    _componentCache.cache.put('uniphoreData', data);
    setUniphoreData(data);
  }
  function handleDescriptionChange(content, delta, source, editor) {
    updateInteraction({
      descriptionHTML: content,
      descriptionText: editor.getText()
    });
    if (paneState?.descriptionHTML?.length > 1) {
      setIsSaveVisible(true);
    }
    !uniPhoreEnabled && setUniphored(true);
  }
  const manageCategory = vl => {
    changeTabTitle(paneIndex, vl);
    updateInteraction({
      category: vl,
      subCategoryOne: initialInteractionState.subCategoryOne,
      subCategoryTwo: initialInteractionState.subCategoryTwo
    });
  };
  function linkCaseCondition() {
    let conditionSatisfied = false;
    if (paneState.linkCaseData?.length > 0) conditionSatisfied = true;
    return conditionSatisfied;
  }
  function resetLinkCase() {
    updateInteraction({
      linkCaseData: [],
      linkCaseId: null,
      errorLinkCase: false
    });
  }

  //Handle uniphore acceptence criteria and payload

  const handleUniphoreAccuracy = (response, isEdit) => {
    //setUniphoreAcceptanceAlert(false);

    if (response === _utils.UNIPHORE_ACCURACY.YES) {
      setShowNotes(false);
      updateInteraction({
        uniphoreDataAccurate: _utils.UNIPHORE_ACCURACY.YES,
        autoSubmit: true
      });
      // updateInteraction({ uniphoreDataAccurate: true, autoSubmit: true });
      _componentCache.cache.put('uniphoreDataAccurate', _utils.UNIPHORE_ACCURACY.YES);
      // cache.put('uniphoreDataAccurate', true);
      //setIsEdit((prevValue) => isEdit ?? !prevValue);
    }

    if (response === _utils.UNIPHORE_ACCURACY.NO) {
      setUniphoreAcceptanceAlert(false);
      setShowNotes(true);
      updateInteraction({
        uniphoreDataAccurate: _utils.UNIPHORE_ACCURACY.NO
      });
      // updateInteraction({ uniphoreDataAccurate: false });
      _componentCache.cache.put('uniphoreDataAccurate', _utils.UNIPHORE_ACCURACY.NO);
      // cache.put('uniphoreDataAccurate', false);
      setIsSaveVisible(false);
      setDisableCategory(false);
    }
    if (response === _utils.UNIPHORE_ACCURACY.ALMOST) {
      const htmlGenerated = (0, _utils.generateHTML)(uniphoreData?.uniphoreSummary);
      setUniphoreAcceptanceAlert(false);
      setShowNotes(true);
      updateInteraction({
        uniphoreDataAccurate: _utils.UNIPHORE_ACCURACY.ALMOST,
        descriptionHTML: htmlGenerated.htmlContent,
        descriptionText: htmlGenerated.htmlDescription
      });
      _componentCache.cache.put('uniphoreDataAccurate', _utils.UNIPHORE_ACCURACY.ALMOST);
      _componentCache.cache.put('descriptionHTML', htmlGenerated.htmlContent);
      _componentCache.cache.put('descriptionText', htmlGenerated.htmlDescription);
      setIsSaveVisible(false);
      setDisableCategory(false);
    }
  };

  // function getHeaderBar() {
  //     return (
  //         <div className="d-flex flex-row justify-content-between case-text">
  //             <div>
  //                 <Row className="case-heading">CSR ID</Row>
  //                 <Row className="case-heading-detail">{agentId}</Row>
  //             </div>

  //             <div>
  //                 <Row className="case-heading">Channel</Row>
  //                 <Row className="case-heading-detail">{channel}</Row>
  //             </div>

  //             <div>
  //                 <Row className="case-heading">Start Time</Row>
  //                 <Row className="case-heading-detail">
  //                     {paneState?.startTime}
  //                 </Row>
  //             </div>
  //             {!isEdit && (
  //                 <div>
  //                     <Row className="case-heading">End Time</Row>
  //                     <Row className="case-heading-detail">
  //                         {paneState?.endTime}
  //                     </Row>
  //                 </div>
  //             )}

  //             <div>
  //                 <Row className="case-heading">CTN</Row>
  //                 <Row className="case-heading-detail">{ctn}</Row>
  //             </div>

  //             <div>
  //                 <Row className="case-heading">BAN</Row>
  //                 <Row className="case-heading-detail">{ban}</Row>
  //             </div>
  //         </div>
  //     );
  // }
  function getUniphoreInteractionDetails() {
    return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
      className: "uniphore-tag-container"
    }, uniphoreData?.uniphoreTags?.map((tag, index) => {
      return /*#__PURE__*/_react.default.createElement("div", {
        key: index
      }, /*#__PURE__*/_react.default.createElement(_antd.Tag, {
        onClose: e => {
          e.preventDefault();
          const newTags = [...uniphoreData?.uniphoreTags];
          newTags?.splice(index, 1);
          handleUniphoreData('uniphoreTags', newTags);
        },
        key: index
      }, tag));
    })), /*#__PURE__*/_react.default.createElement("div", {
      className: "uniphore-timeline"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "call-summary"
    }, /*#__PURE__*/_react.default.createElement(Text, null, "Call Summary")), /*#__PURE__*/_react.default.createElement("div", {
      className: "uniphore-call-summary-details"
    }, uniphoreData?.uniphoreSummary && uniphoreData?.uniphoreSummary?.length ? /*#__PURE__*/_react.default.createElement("div", {
      className: "uniphore-call-summary-details"
    }, UniphoreIssueData && renderSummary(UniphoreIssueData), UniphoreTroubleShootingData && renderSummary(UniphoreTroubleShootingData), UniphoreResolutionData && renderSummary(UniphoreResolutionData), UniphoreCustomerName && renderSummary(UniphoreCustomerName), UniphoreCTN && renderSummary(UniphoreCTN)) : /*#__PURE__*/_react.default.createElement("div", {
      className: "uniphore-error"
    }, /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_icons.RobotOutlined, {
      style: {
        fontSize: '32px'
      }
    })), /*#__PURE__*/_react.default.createElement("p", null, "Uniphore interactions will be updated as soon as the call ends.")))));
  }
  function getInteractionNotes() {
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mb-2"
    }, /*#__PURE__*/_react.default.createElement(_componentNotes.default, {
      style: {
        height: '18rem',
        width: '100%',
        borderLeft: 'none',
        borderRight: 'none'
      },
      theme: "snow",
      value: paneState?.descriptionHTML,
      onChange: handleDescriptionChange
    }), linkCaseCondition() ? /*#__PURE__*/_react.default.createElement("div", {
      style: {
        marginTop: '50px'
      }
    }, /*#__PURE__*/_react.default.createElement(_antd.Row, null, /*#__PURE__*/_react.default.createElement(_antd.Col, {
      xs: 24
    }, /*#__PURE__*/_react.default.createElement(_antd.Table, {
      rowKey: "caseId",
      rowSelection: {
        type: 'radio',
        ...rowSelection,
        selectedRowKeys: selectedRows
      },
      columns: linkCaseColumns,
      dataSource: paneState?.linkCaseData || []
    })))) : null, /*#__PURE__*/_react.default.createElement("div", {
      className: "save-interaction-error"
    }, paneState.errorLinkCase), /*#__PURE__*/_react.default.createElement("div", {
      className: "d-flex justify-content-between",
      style: {
        marginTop: '3.5rem'
      }
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "bottom-buttons"
    }, createPrivileges && /*#__PURE__*/_react.default.createElement(_antd.Button, {
      type: "primary",
      onClick: handleLinkCase
    }, linkCaseCondition() ? 'Reset Case' : 'Link Case'), paneState.category !== 'Select Category' && paneState.subCategoryOne !== 'Select Category 1' && paneState.subCategoryTwo !== 'Select Category 2' && isSaveVisible &&
    /*#__PURE__*/
    // paneState.interactionTags.length > 0 &&
    // uniphored &&
    _react.default.createElement(_antd.Button, {
      style: {
        background: '#52c41a',
        border: 'none'
      },
      type: "primary",
      onClick: () => {
        handleToggleEdit();
        handleSaveInteraction();
      }
    }, "Proceed to confirm")), /*#__PURE__*/_react.default.createElement(Text, null, paneState?.startTime, " -", ' ', interactionEndTime ? interactionEndTime : 'Loading..')));
  }
  const beforeUnloadListener = event => {
    event.preventDefault();
    saveInteractionBeforeUnload();
    return event.returnValue = 'Are you sure you want to exit?';
  };
  (0, _react.useEffect)(() => {
    sessionStorage.setItem('category', paneState.category);
    sessionStorage.setItem('subCategory1', paneState.subCategoryOne);
    sessionStorage.setItem('subCategory2', paneState.subCategoryTwo);
    sessionStorage.setItem('descriptionText', paneState.descriptionText);
  }, [paneState]);
  const saveInteraction = (subject, topic, data) => {
    handleSaveInteraction(null, true, data);
  };
  const saveInteractionBeforeUnload = (subject, topic, data) => {
    handleSaveInteraction(null, false, data, true);
  };
  const showSaveManualInteractionModal = () => {
    setIsSaveManualInteractionModalVisible(true);
  };
  const handleSaveManualInteractionRetry = () => {
    getUniphoreInteraction(initialInteractionState?.uniphoreSessionId);
    if (saveManualIteractionButtonLoading) {
      setIsSaveManualInteractionModalVisible(true);
    } else {
      setIsSaveManualInteractionModalVisible(false);
    }
  };
  const handleSaveManualInteractionYes = () => {
    setIsSaveManualInteractionModalVisible(false);
    setShowNotes(true);
    _componentCache.cache.put(`showNotes`, "true");
    setIsSaveVisible(false);
    setDisableCategory(false);
    setIsShowSaveManualInteractionButton(false);
  };
  const handleChatId = e => {
    const text = e.target.value || '';
    const chatRegexPattern = RegExp('^[a-zA-Z0-9_+-]*$');
    if (e.target.value?.length < 41) {
      if (chatRegexPattern.test(text)) {
        setChatId(e.target.value.replace(/\s/g, ''));
        setChatIdErrorMessage('');
      } else {
        setChatIdErrorMessage('special characters are not allowed');
      }
    }
  };
  (0, _react.useEffect)(() => {
    if (interactionId !== '') {
      //condition to avoid popup if interaction id is not present
      window.addEventListener('beforeunload', beforeUnloadListener, {
        capture: true
      });
    }
    _componentMessageBus.MessageBus.subscribe(INTERACTION_AUTO_SAVE_INITIATE, INTERACTION_AUTO_SAVE_INITIATE, saveInteraction);
    sessionStorage.setItem('ghostCall', false);
    return () => {
      _componentMessageBus.MessageBus.unsubscribe(INTERACTION_AUTO_SAVE_INITIATE);
    };
  }, []);
  (0, _react.useEffect)(() => {
    if (!isEdit) {
      const endTime = _moment.default.tz((0, _moment.default)().format(), 'America/New_York').format('hh:mm:ss a');
      updateInteraction({
        endTime: endTime,
        save: !isEdit
      });
      setInteractionEndTime(endTime);
    } else {
      updateInteraction({
        endTime: null,
        save: !isEdit
      });
      setInteractionEndTime(null);
    }
  }, [isEdit]);
  (0, _react.useEffect)(() => {
    updateInteraction({
      descriptionHTML: messages.map(obj => obj.msg).join('<br/>') + paneState.descriptionHTML
    });
  }, [messages]);
  (0, _react.useEffect)(() => {
    if (uniphored && uniErr === false) {
      setUniphoreAcceptanceAlert(true);
    } else {
      setUniphoreAcceptanceAlert(false);
    }
  }, [uniphored]);
  (0, _react.useEffect)(() => {
    if (uniErr) {
      setShowNotes(true);
      setDisableCategory(false);
    }
  }, [uniErr]);
  (0, _react.useEffect)(() => {
    // initially checking for truthy value so now we checking if it is 'yes'
    if (paneState.uniphoreDataAccurate === _utils.UNIPHORE_ACCURACY.YES) {
      handleSaveInteraction(paneState.uniphoreDataAccurate);
    }
  }, [paneState.uniphoreDataAccurate]);
  (0, _react.useEffect)(() => {
    // initially checking for truthy value so now we checking if it is 'yes'
    if (redirectToIH && paneState?.uniphoreDataAccurate === _utils.UNIPHORE_ACCURACY.YES) {
      resetModal();
      window[sessionStorage.tabId].conversationId = window[sessionStorage.tabId]?.sessionConversationId;
    }
  }, [redirectToIH]);
  const handlePreviewButtonClick = () => {
    if (uniphoreSessionId) {
      getUniphoreInteraction(uniphoreSessionId, true); // adding the 2nd arguement as true for preview button clicked yes.
    }
  };

  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, isEdit ? /*#__PURE__*/_react.default.createElement(_antd.Row, null, uniPhoreEnabled && uniphoreAcceptanceAlert && /*#__PURE__*/_react.default.createElement(_antd.Col, {
    xs: 24,
    lg: 24,
    style: {
      padding: '16px 24px 0 24px'
    }
  }, /*#__PURE__*/_react.default.createElement(_antd.Alert, {
    description: "Is the primary reason for the call accurate?",
    type: "success",
    action: /*#__PURE__*/_react.default.createElement(_antd.Space, null, /*#__PURE__*/_react.default.createElement(_antd.Button, {
      size: "small",
      type: "primary",
      onClick: () => handleUniphoreAccuracy(_utils.UNIPHORE_ACCURACY.YES)
    }, "Yes, Submit Interaction"), /*#__PURE__*/_react.default.createElement(_antd.Button, {
      size: "small",
      type: "ghost",
      onClick: () => handleUniphoreAccuracy(_utils.UNIPHORE_ACCURACY.ALMOST)
    }, "Almost Accurate"), /*#__PURE__*/_react.default.createElement(_antd.Button, {
      size: "small",
      danger: true,
      type: "ghost",
      onClick: () => handleUniphoreAccuracy(_utils.UNIPHORE_ACCURACY.NO)
    }, "No"))
  }), paneState.saveInteractionError !== '' && /*#__PURE__*/_react.default.createElement("div", {
    className: "save-interaction-error"
  }, paneState.saveInteractionError)), /*#__PURE__*/_react.default.createElement(_antd.Col, {
    xs: 24,
    lg: uniPhoreEnabled ? 12 : 24,
    style: {
      padding: '16px 24px'
    }
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "d-flex flex-row justify-content-between align-items-center w-100"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "select-row"
  }, /*#__PURE__*/_react.default.createElement(_antd.Select, {
    value: paneState.category,
    disabled: uniPhoreEnabled ? disableCategory ? true : false : false,
    onChange: manageCategory,
    style: {
      width: 160
    }
  }, interactionCategories.length > 0 && interactionCategories.map(option => /*#__PURE__*/_react.default.createElement(_antd.Select.Option, {
    value: option.name,
    key: _shortid.default.generate()
  }, option.name))), paneState.category !== 'Select Category' && /*#__PURE__*/_react.default.createElement(_antd.Select, {
    value: paneState.subCategoryOne,
    disabled: uniPhoreEnabled ? disableCategory ? true : false : false,
    onChange: value => updateInteraction({
      subCategoryOne: value,
      subCategoryTwo: initialInteractionState.subCategoryTwo
    }),
    style: {
      width: 200
    }
  }, interactionCategories.find(c => c.name === paneState.category)?.categories.map(option => /*#__PURE__*/_react.default.createElement(_antd.Select.Option, {
    value: option.name,
    key: _shortid.default.generate()
  }, option.name))), paneState.subCategoryOne !== 'Select Category 1' && /*#__PURE__*/_react.default.createElement(_antd.Select, {
    value: paneState.subCategoryTwo,
    onChange: value => updateInteraction({
      subCategoryTwo: value
    }),
    disabled: uniPhoreEnabled ? disableCategory ? true : false : false,
    style: {
      width: 200
    }
  }, interactionCategories.find(c => c.name === paneState.category)?.categories.find(sco => sco.name === paneState.subCategoryOne)?.categories.map(option => /*#__PURE__*/_react.default.createElement(_antd.Select.Option, {
    value: option.name,
    key: _shortid.default.generate()
  }, option.name))),
  // chat id for non uniphore interaction and non voice
  !uniPhoreEnabled && showChatIdField && /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_antd.Input, {
    placeholder: "Enter Chat ID",
    value: chatId,
    onChange: handleChatId
  }), /*#__PURE__*/_react.default.createElement("br", null), chatIdErrorMessage !== '' && /*#__PURE__*/_react.default.createElement("span", {
    style: {
      color: 'red',
      fontSize: '10px'
    }
  }, chatIdErrorMessage)), interactionCategories.length === 0 && /*#__PURE__*/_react.default.createElement("div", {
    className: "save-interaction-error"
  }, "Error loading categories or subcategories.")))), uniPhoreEnabled && /*#__PURE__*/_react.default.createElement(_antd.Col, {
    xs: 24,
    lg: 12,
    style: {
      padding: '16px 24px 0 24px'
    }
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "uniphore-tag-container"
  }, /*#__PURE__*/_react.default.createElement(_antd.Select, {
    mode: "tags",
    style: {
      width: '100%',
      marginBottom: '16px'
    },
    placeholder: "Start typing to create tag",
    onChange: handleInteractionTags,
    defaultValue: paneState.interactionTags,
    tagRender: tagRender
  }, normalIteractionTags))), uniPhoreEnabled ? showNotes && /*#__PURE__*/_react.default.createElement(_antd.Col, {
    xs: 24,
    lg: uniPhoreEnabled ? 12 : 24,
    style: {
      padding: '0 24px '
    }
  }, getInteractionNotes()) : /*#__PURE__*/_react.default.createElement(_antd.Col, {
    xs: 24,
    lg: uniPhoreEnabled ? 12 : 24,
    style: {
      padding: '0 24px '
    }
  }, getInteractionNotes()), uniPhoreEnabled && /*#__PURE__*/_react.default.createElement(_antd.Col, {
    xs: 24,
    lg: showNotes ? 12 : 24,
    style: {
      background: '#f3f3f3',
      padding: '24px'
    }
  }, uniErr ? /*#__PURE__*/_react.default.createElement("div", {
    className: "uniphore-error"
  }, /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_icons.RobotOutlined, {
    style: {
      fontSize: '32px',
      marginBottom: '24px'
    }
  })), /*#__PURE__*/_react.default.createElement("p", {
    style: {
      color: 'red'
    }
  }, uniphoreError)) : /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
    className: "uniphore-tag-container"
  }, uniphoreData?.uniphoreTags?.map((tag, index) => {
    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_antd.Tag, {
      onClose: e => {
        e.preventDefault();
        const newTags = [...uniphoreData?.uniphoreTags];
        newTags?.splice(index, 1);
        handleUniphoreData('uniphoreTags', newTags);
      },
      key: index
    }, tag));
  })), /*#__PURE__*/_react.default.createElement("div", {
    className: "uniphore-timeline"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "call-summary"
  }, /*#__PURE__*/_react.default.createElement(Text, null, "Call Summary"), /*#__PURE__*/_react.default.createElement(Text, null, paneState?.startTime, " -", ' ', interactionEndTime ? interactionEndTime : 'Loading..')), /*#__PURE__*/_react.default.createElement("div", {
    className: "uniphore-call-summary-details"
  }, uniphoreData?.uniphoreSummary && uniphoreData?.uniphoreSummary?.length ? /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, UniphoreIssueData && renderSummary(UniphoreIssueData), UniphoreTroubleShootingData && renderSummary(UniphoreTroubleShootingData), UniphoreResolutionData && renderSummary(UniphoreResolutionData), UniphoreCustomerName && renderSummary(UniphoreCustomerName), UniphoreCTN && renderSummary(UniphoreCTN)) : /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
    className: "uniphore-error"
  }, /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_icons.RobotOutlined, {
    style: {
      fontSize: '32px',
      marginBottom: '24px'
    }
  })), /*#__PURE__*/_react.default.createElement("p", null, "Uniphore interactions will be updated as soon as the call ends."), /*#__PURE__*/_react.default.createElement("small", null, "Interaction can only be saved once the call ends !"))))), /*#__PURE__*/_react.default.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '5px'
    }
  }, /*#__PURE__*/_react.default.createElement(_antd.Modal, {
    title: "Are you sure you want to save a manual interaction?",
    open: isModalSaveManualInteractionVisible,
    onCancel: () => setIsSaveManualInteractionModalVisible(false),
    footer: [/*#__PURE__*/_react.default.createElement(_antd.Button, {
      key: "submit",
      type: "primary",
      onClick: handleSaveManualInteractionYes
    }, "Yes"), /*#__PURE__*/_react.default.createElement(_antd.Button, {
      key: "back",
      onClick: handleSaveManualInteractionRetry,
      loading: saveManualIteractionButtonLoading
    }, "No, Retry")]
  }, /*#__PURE__*/_react.default.createElement("p", null, "We have not received a summary from Uniphore yet. This could be due to some latency or it is not available. Are you sure you want to abandon Uniphore and save a manual interaction?")), !uniphored && /*#__PURE__*/_react.default.createElement(_antd.Button, {
    onClick: handlePreviewButtonClick,
    style: {
      marginTop: '24px',
      backgroundColor: uniphorePreviewed ? "lightgray" : "#52C41B",
      textDecoration: 'none',
      color: 'white'
    },
    className: "previewButton",
    disabled: uniphorePreviewed
  }, "Preview"), isShowSaveManualInteractionButton && /*#__PURE__*/_react.default.createElement(_antd.Button, {
    type: "primary",
    onClick: showSaveManualInteractionModal,
    style: {
      marginTop: '24px'
    }
  }, "Save Manual Interaction"), uniphorePreviewed && !uniphored && /*#__PURE__*/_react.default.createElement("div", {
    style: {
      marginLeft: 'auto'
    }
  }, "This is a preview - Content subject to change."))))) : /*#__PURE__*/_react.default.createElement(_antd.Row, null, /*#__PURE__*/_react.default.createElement(_antd.Col, {
    xs: 24,
    lg: uniPhoreEnabled ? 12 : 24,
    style: {
      padding: '24px'
    }
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "d-flex flex-row"
  }, /*#__PURE__*/_react.default.createElement(_antd.Space, {
    direction: "vertical",
    size: "middle",
    style: {
      width: '100%'
    }
  }, /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_antd.Space, {
    size: 10
  }, paneState.category && /*#__PURE__*/_react.default.createElement(_antd.Tag, {
    color: "#F6FFED",
    className: "stat-tab"
  }, paneState.category), paneState.subCategoryOne && /*#__PURE__*/_react.default.createElement(_antd.Tag, {
    color: "#E6F7FF",
    className: "stat-tab"
  }, paneState.subCategoryOne), paneState.subCategoryTwo && /*#__PURE__*/_react.default.createElement(_antd.Tag, {
    color: "#E6F7FF",
    className: "stat-tab"
  }, paneState.subCategoryTwo),
  // chat id for non uniphore interaction and non voice
  !uniPhoreEnabled && showChatIdField && /*#__PURE__*/_react.default.createElement(_antd.Input, {
    placeholder: "Enter Chat ID",
    value: chatId,
    onChange: handleChatId,
    disabled: true
  })), /*#__PURE__*/_react.default.createElement("hr", {
    style: {
      width: '100%',
      marginTop: 10,
      marginBottom: 0
    },
    color: "#dddddd",
    noshade: true
  })), paneState?.interactionTags.length > 0 && /*#__PURE__*/_react.default.createElement("div", {
    className: "uniphore-tag-container"
  }, paneState?.interactionTags.length > 0 && paneState.interactionTags.map((item, index) => {
    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_antd.Tag, {
      key: index,
      color: "success"
    }, item));
  }), /*#__PURE__*/_react.default.createElement("hr", {
    style: {
      width: '100%',
      marginTop: 0,
      marginBottom: 0
    },
    color: "#dddddd",
    noshade: true
  })), /*#__PURE__*/_react.default.createElement(_antd.Row, null, /*#__PURE__*/_react.default.createElement(_antd.Col, {
    xs: 24,
    className: "confirmpage-heading"
  }, "Description"), /*#__PURE__*/_react.default.createElement("div", {
    style: {
      width: '100%',
      height: '16rem',
      overflowY: 'scroll'
    },
    xs: 24,
    className: "confirmpage-text",
    dangerouslySetInnerHTML: {
      __html: paneState.descriptionHTML
    }
  })), /*#__PURE__*/_react.default.createElement("div", {
    className: "d-flex flex-row align-items-center justify-content-between action-buttons"
  }, /*#__PURE__*/_react.default.createElement("div", {
    style: {
      display: 'flex',
      width: '100%',
      justifyContent: 'flex-start',
      alignItems: 'center',
      gap: '1rem'
    }
  }, /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_antd.Button, {
    type: "default",
    onClick: () => {
      handleToggleEdit();
      updateInteraction({
        finalStep: false,
        saved: false
      });
      resetInteractionTitle();
    }
  }, "Edit", /*#__PURE__*/_react.default.createElement(_icons.EditOutlined, null)))), /*#__PURE__*/_react.default.createElement(Text, null, paneState?.startTime, " -", ' ', interactionEndTime ? interactionEndTime : 'Loading..')), paneState.saveInteractionError !== '' && /*#__PURE__*/_react.default.createElement("div", {
    className: "save-interaction-error"
  }, paneState.saveInteractionError)))), uniPhoreEnabled && /*#__PURE__*/_react.default.createElement(_antd.Col, {
    xs: 24,
    lg: 12,
    style: {
      background: '#f3f3f3',
      padding: '24'
    }
  }, uniErr ? /*#__PURE__*/_react.default.createElement("div", {
    className: "uniphore-error"
  }, /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_icons.RobotOutlined, {
    style: {
      fontSize: '32px'
    }
  })), /*#__PURE__*/_react.default.createElement("p", {
    style: {
      color: 'red'
    }
  }, uniphoreError)) : getUniphoreInteractionDetails())));
}
module.exports = exports.default;
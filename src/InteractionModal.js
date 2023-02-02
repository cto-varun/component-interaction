import React, { useState, useEffect } from 'react';
import {
    Select,
    Space,
    Tag,
    Button,
    Row,
    Col,
    Table,
    Typography,
    Alert,
    Modal,
    Input
} from 'antd';
import 'react-quill/dist/quill.snow.css';
import {
    EditOutlined,
    RobotOutlined,
    ExclamationCircleOutlined,
    CheckCircleOutlined,
    ToolOutlined
} from '@ant-design/icons';
import shortid from 'shortid';
import moment from 'moment';
import Notes from '@ivoyant/component-notes';
import { MessageBus } from '@ivoyant/component-message-bus';
import { cache } from '@ivoyant/component-cache';
import { generateHTML, UNIPHORE_ACCURACY } from './utils';

const { Text } = Typography;

const INTERACTION_AUTO_SAVE_INITIATE = 'INTERACTION.AUTO.SAVE';

const linkCaseColumns = [
    {
        title: 'Case ID',
        dataIndex: 'caseId',
        key: 'caseId',
    },
    {
        title: 'Created At',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (value) => {
            return new Date(value).toLocaleString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hourCycle: 'h12',
            });
        },
    },
    {
        title: 'Updated By',
        dataIndex: 'updatedBy',
        key: 'updatedBy',
        render: (text, data) => <>{data?.caseHistory[0]?.updatedBy}</>,
    },
    {
        title: 'Category',
        dataIndex: 'category',
        key: 'category',
        render: (text, data) => <>{data?.caseHistory[0]?.category}</>,
    },
];

// NORMAL TAGS SELECTOR
const { Option } = Select;

function tagRender(props) {
    const { label, value, closable, onClose } = props;
    const onPreventMouseDown = (event) => {
        event.preventDefault();
        event.stopPropagation();
    };
    return (
        <Tag
            color="success"
            onMouseDown={onPreventMouseDown}
            closable={closable}
            onClose={onClose}
            style={{ marginRight: 3 }}
        >
            {label}
        </Tag>
    );
}

export default function InteractionModal(props) {
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

    const UniSummary = uniphoreData?.uniphoreSummary?.map(({label, body}) => {
        return {
            label,
            body : body[0].split(',')
        }
    })

    const UniphoreIssueData = UniSummary?.find((us) => us?.label === "Reason for Call");
    const UniphoreResolutionData = UniSummary?.find((us) => us?.label === "Resolution");
    const UniphoreTroubleShootingData = UniSummary?.find((us) => us?.label === "Recommendation or Troubleshooting step");
    const UniphoreCustomerName = UniSummary?.find((us) => us?.label === "Customer Name");
    const UniphoreCTN = UniSummary?.find((us) => us?.label === "CTN");

    const renderSummary = ({label, body}) => {
        let UniIcon;
        if(label === "Reason for Call")
        {
             UniIcon = <ExclamationCircleOutlined style={{ fontSize: '24px', color: '#ff4d4f', marginRight: '8px'}} />
        }
        else if (label === "Recommendation or Troubleshooting step")
        {
             UniIcon = <ToolOutlined style={{ fontSize: '24px', color: '#52c41a', marginRight: '8px'}} />
        }
        else if (label === "Resolution")
        {
             UniIcon = <ExclamationCircleOutlined style={{ fontSize: '24px', color: '#52c41a', marginRight: '8px'}} />
        }

        return <>
        <div className="uniphore-call-summary-label">
                {UniIcon}
                <small>
                    {label}
                </small>
            </div>
            <ul>

            {
                (label === "Reason for Call" || label === "Issue") ?
                body?.map(
                    (data,idx) => idx === 0 ? <li style={{ fontWeight: '600'}} key={ idx }> {data}</li>  : <li key={ idx }> {data}</li> )
                : (label === "CTN" ? body?.map( (data,idx) => <li key={ idx }> {data?.slice(data?.length - 4)}</li> )
                : body?.map( (data,idx) => <li key={ idx }> {data}</li> ))
            }
            </ul>
</>
    }

    const initialInteractionState = {
        category: 'Select Category',
        subCategoryOne: 'Select Category 1',
        subCategoryTwo: 'Select Category 2',
    };
    const normalIteractionTags = interactionTags
        .filter(({ name }) => name)
        .map((item) => (
            <Option key={item.name} style={{ marginBottom: '4px' }}>
                {item.name}
            </Option>
        ));

    function handleInteractionTags(value) {
        handleUniphoreData('interactionTags', value); // TO-DO : REMOVE THIS IF NO USE
        updateInteraction({
            interactionTags: value,
        });
    }

    const params = component?.params ? component.params : {};

    if (store?.response?.['save-interaction-options']) {
        Object.assign(
            properties,
            store?.response?.['save-interaction-options']
        );
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
        linkCaseWorkflow,
    } = properties;
    const { interactionChannel = ['Voice', 'Chat', 'Email'] } = options;
    const interactionState = cache.get('interaction');
    const {
        interactionId = '',
        ctn = '',
        ban = '',
        agentId = '',
        channel = interactionChannel[0],
    } = interactionState || {};

    const [isEdit, setIsEdit] = useState(!paneState.save);
    const [selectedRows, setSelectedRows] = useState([]);
    const [interactionEndTime, setInteractionEndTime] = useState();

    const [showNotes, setShowNotes] = useState(cache.get(`showNotes`) === "true" ? true :false);
    const [redirectToIH, setRedirectToIH] = useState(false);
    const [disableCategory, setDisableCategory] = useState(true);
    const [
        isModalSaveManualInteractionVisible,
        setIsSaveManualInteractionModalVisible,
    ] = useState(false);
    const [
        isShowSaveManualInteractionButton,
        setIsShowSaveManualInteractionButton,
    ] = useState(true);
    const [chatId, setChatId] = useState('')
    const [chatIdErrorMessage,setChatIdErrorMessage] = useState('')
    const [showChatIdField, setShowChatIdField] = useState(window[window.sessionStorage?.tabId][`Interaction_Source`] !== "Voice");

    const {
        workflow,
        datasource,
        successStates,
        errorStates,
        responseMapping,
    } = saveInteractionWorkflow;

    const {
        workflow: linkWorkflow,
        datasource: linkCaseDatasource,
        successStates: linkCaseSuccessStates,
        errorStates: linkCaseErrorStates,
        responseMapping: linkCaseResponseMapping,
    } = linkCaseWorkflow;

    const updateInteraction = (props) => {
        if (props) {
            const newState = { ...paneState, ...props };
            updatePaneState(paneIndex, newState);
        }
    };
    const handleResponse = (automaticSaveInitiated, agentOpted) => (
        subscriptionId,
        topic,
        eventData,
        closure
    ) => {
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
                        saveInteractionError: '',
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
                    saveInteractionError: eventData.event.data.message,
                });
            }
            MessageBus.unsubscribe(subscriptionId);
        }
    };

    const handleToggleEdit = (isEdit) => {
        setIsEdit((prevValue) => isEdit ?? !prevValue);
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
                        errorLinkCase: false,
                    });
                }
            }
            if (isFailure) {
                // setSaveInteractionError(eventData.event.data.message);
                updateInteraction({
                    errorLinkCase:
                        eventData?.event?.data?.message ||
                        'Internal Server Error, Please try again later',
                });
            }
            MessageBus.unsubscribe(subscriptionId);
        }
    }

    function handleLinkCase() {
        if (linkCaseCondition()) resetLinkCase();
        else {
            const submitEvent = 'SUBMIT';
            const linkDataSource = datasources[linkCaseDatasource];
            MessageBus.send('WF.'.concat(linkWorkflow).concat('.INIT'), {
                header: {
                    registrationId: linkWorkflow,
                    workflow: linkWorkflow,
                    eventType: 'INIT',
                },
            });
            MessageBus.subscribe(
                linkWorkflow,
                'WF.'.concat(linkWorkflow).concat('.STATE.CHANGE'),
                handleLinkCaseResponse
            );
            MessageBus.send(
                'WF.'.concat(linkWorkflow).concat('.').concat(submitEvent),
                {
                    header: {
                        registrationId: linkWorkflow,
                        workflow: linkWorkflow,
                        eventType: submitEvent,
                    },
                    body: {
                        datasource: linkDataSource,
                        request: {
                            body: {
                                billingAccountNumber: ban,
                            },
                        },
                        responseMapping: linkCaseResponseMapping,
                    },
                }
            );
        }
    }

    const getValueFromSession = (key) =>
        sessionStorage.getItem(key)
            ? sessionStorage.getItem(key).includes('Select')
                ? 'NA'
                : sessionStorage.getItem(key)
            : '';

    const handleSaveInteraction = (
        uniphoreAccurateInteraction,
        automaticSaveInitiated,
        data,
        agentOpted
    ) => {
        const { body = {} } = data || {};
        const {
            category = undefined,
            subCategory1 = undefined,
            subCategory2 = undefined,
            notes = undefined,
            ghostCall = false,
        } = body;
        sessionStorage.setItem('ghostCall', ghostCall);
        const submitEvent = 'SUBMIT';
        const interactionState = cache.get('interaction');
        const {
            interactionId = '',
            ctn = '',
            ban = '',
            agentId = '',
            channel = interactionChannel[0],
        } = interactionState || {};
        const { attId = '' } = window[sessionStorage.tabId].COM_IVOYANT_VARS;
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
            autoSubmit: paneState?.autoSubmit,
        };
        if(!showChatIdField)
        {
            saveInteractionObject.interactionSource = "Voice"
        }
        else if(showChatIdField && chatId === '')
        {
            saveInteractionObject.interactionSource = "Manual"
        }
        else if(showChatIdField && chatId !== '')
        {
            saveInteractionObject.chatId = chatId;
            saveInteractionObject.interactionSource = "Chat"
        }
        const uniphoreCacheData = cache.get('uniphoreData');
        const uniphoreDataAccurateCache = cache.get('uniphoreDataAccurate');
        if (!saveInteractionObject['uniphoreSummary'] && uniphoreCacheData)
            saveInteractionObject['uniphoreSummary'] =
                uniphoreCacheData['uniphoreSummary'];
        if (!saveInteractionObject['uniphoreTags'] && uniphoreCacheData)
            saveInteractionObject['uniphoreTags'] =
                uniphoreCacheData['uniphoreTags'];
        if (
            !saveInteractionObject['uniphoreDataAccurate'] &&
            uniphoreDataAccurateCache !== undefined
        ) {
            saveInteractionObject[
                'uniphoreDataAccurate'
            ] = uniphoreDataAccurateCache;
        }
        if (interactionId !== '') {
            if (ghostCall) {
                saveInteractionObject['category'] = category;
                saveInteractionObject['subCategory1'] = subCategory1;
                saveInteractionObject['subCategory2'] = subCategory2;
                saveInteractionObject['interactionSummary'] = notes;
            } else if (automaticSaveInitiated || agentOpted) {
                // if user has opted to leave the page or accidently browswer is being closed or agent remained idle for time mentioned in variable in config.js file at line number 48 :- interactionIdleTimeout
                saveInteractionObject['category'] = getValueFromSession(
                    'category'
                );
                saveInteractionObject['subCategory1'] = getValueFromSession(
                    'subCategory1'
                );
                saveInteractionObject['subCategory2'] = getValueFromSession(
                    'subCategory2'
                );
                if (automaticSaveInitiated)
                    saveInteractionObject['interactionSummary'] =
                        getValueFromSession('descriptionText') +
                        (attId +
                            ' :- Idle time reached 55 minutes. Automatic save initiated.');
                else
                    saveInteractionObject['interactionSummary'] =
                        getValueFromSession('descriptionText') !== ''
                            ? getValueFromSession('descriptionText')
                            : attId +
                              ' agent opted to leave. Automatic save initiated.';
            }
            if (!paneState.linkCaseId) delete saveInteractionObject.linkCaseId;

            if (window[window.sessionStorage?.tabId].createdCaseId) {
                saveInteractionObject.caseId =
                    window[window.sessionStorage?.tabId].createdCaseId;
            }
            if (
                window[window.sessionStorage?.tabId].timerSeconds &&
                uniphoreAccurateInteraction
            ) {
                saveInteractionObject.customerCallEndTime = moment(
                    interactionState?.startTime
                )
                    .add(
                        window[window.sessionStorage?.tabId].timerSeconds,
                        'seconds'
                    )
                    .format('YYYY-MM-DD HH:mm:ssZZ');
            }

            MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
                header: {
                    registrationId: workflow,
                    workflow,
                    eventType: 'INIT',
                },
            });
            MessageBus.subscribe(
                workflow,
                'WF.'.concat(workflow).concat('.STATE.CHANGE'),
                handleResponse(automaticSaveInitiated, agentOpted)
            );
            MessageBus.send(
                'WF.'.concat(workflow).concat('.').concat(submitEvent),
                {
                    header: {
                        registrationId: workflow,
                        workflow,
                        eventType: submitEvent,
                    },
                    body: {
                        datasource: datasources[datasource],
                        request: {
                            body: saveInteractionObject,
                        },
                        responseMapping,
                    },
                }
            );
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
            updateInteraction({ linkCaseId: selectedRows[0]?.caseId });
        },
    };

    function handleUniphoreData(field, value) {
        const data = {
            ...uniphoreData,
            [field]: value,
        };
        cache.put('uniphoreData', data);
        setUniphoreData(data);
    }

    function handleDescriptionChange(content, delta, source, editor) {
        updateInteraction({
            descriptionHTML: content,
            descriptionText: editor.getText(),
        });
        if (paneState?.descriptionHTML?.length > 1) {
            setIsSaveVisible(true);
        }
        !uniPhoreEnabled && setUniphored(true);
    }

    const manageCategory = (vl) => {
        changeTabTitle(paneIndex, vl);
        updateInteraction({
            category: vl,
            subCategoryOne: initialInteractionState.subCategoryOne,
            subCategoryTwo: initialInteractionState.subCategoryTwo,
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
            errorLinkCase: false,
        });
    }

    //Handle uniphore acceptence criteria and payload

    const handleUniphoreAccuracy = (response, isEdit) => {
        //setUniphoreAcceptanceAlert(false);

        if (response === UNIPHORE_ACCURACY.YES) {
            setShowNotes(false);
            updateInteraction({
                uniphoreDataAccurate: UNIPHORE_ACCURACY.YES,
                autoSubmit: true,
            });
            // updateInteraction({ uniphoreDataAccurate: true, autoSubmit: true });
            cache.put('uniphoreDataAccurate', UNIPHORE_ACCURACY.YES);
            // cache.put('uniphoreDataAccurate', true);
            //setIsEdit((prevValue) => isEdit ?? !prevValue);
        }
        if (response === UNIPHORE_ACCURACY.NO) {
            setUniphoreAcceptanceAlert(false);
            setShowNotes(true);
            updateInteraction({ uniphoreDataAccurate: UNIPHORE_ACCURACY.NO });
            // updateInteraction({ uniphoreDataAccurate: false });
            cache.put('uniphoreDataAccurate', UNIPHORE_ACCURACY.NO);
            // cache.put('uniphoreDataAccurate', false);
            setIsSaveVisible(false);
            setDisableCategory(false);
        }
        if (response === UNIPHORE_ACCURACY.ALMOST) {
            const htmlGenerated = generateHTML(uniphoreData?.uniphoreSummary);
            setUniphoreAcceptanceAlert(false);
            setShowNotes(true);
            updateInteraction({
                uniphoreDataAccurate: UNIPHORE_ACCURACY.ALMOST,
                descriptionHTML: htmlGenerated.htmlContent,
                descriptionText: htmlGenerated.htmlDescription,
            });
            cache.put('uniphoreDataAccurate', UNIPHORE_ACCURACY.ALMOST);
            cache.put('descriptionHTML', htmlGenerated.htmlContent);
            cache.put('descriptionText', htmlGenerated.htmlDescription);
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
        return (
            <>
                <div className="uniphore-tag-container">
                    {uniphoreData?.uniphoreTags?.map((tag, index) => {
                        return (
                            <div key={index}>
                                <Tag
                                    onClose={(e) => {
                                        e.preventDefault();
                                        const newTags = [
                                            ...uniphoreData?.uniphoreTags,
                                        ];
                                        newTags?.splice(index, 1);
                                        handleUniphoreData(
                                            'uniphoreTags',
                                            newTags
                                        );
                                    }}
                                    key={index}
                                >
                                    {tag}
                                </Tag>
                            </div>
                        );
                    })}
                </div>
                <div className="uniphore-timeline">
                    <div className="call-summary">
                        <Text>Call Summary</Text>
                    </div>
                    <div className="uniphore-call-summary-details">
                        {uniphoreData?.uniphoreSummary &&
                        uniphoreData?.uniphoreSummary?.length ? (
                                <div className="uniphore-call-summary-details">
                                    {UniphoreIssueData && renderSummary(UniphoreIssueData)}
                                    {UniphoreTroubleShootingData && renderSummary(UniphoreTroubleShootingData)}
                                    {UniphoreResolutionData && renderSummary(UniphoreResolutionData)}
                                    {UniphoreCustomerName && renderSummary(UniphoreCustomerName)}
                                    {UniphoreCTN && renderSummary(UniphoreCTN)}
                                </div>
                        ) : (
                            <div className="uniphore-error">
                                <div>
                                    <RobotOutlined
                                        style={{
                                            fontSize: '32px',
                                        }}
                                    />
                                </div>
                                <p>
                                    Uniphore interactions will be updated as
                                    soon as the call ends.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </>
        );
    }

    function getInteractionNotes() {
        return (
            <div className="mb-2">
                <Notes
                    style={{
                        height: '18rem',
                        width: '100%',
                        borderLeft: 'none',
                        borderRight: 'none',
                    }}
                    theme="snow"
                    value={paneState?.descriptionHTML}
                    onChange={handleDescriptionChange}
                />
                    {linkCaseCondition() ? (
                        <div style={{marginTop:'50px'}}>
                            <Row>
                            <Col xs={24}>
                                <Table
                                    rowKey="caseId"
                                    rowSelection={{
                                        type: 'radio',
                                        ...rowSelection,
                                        selectedRowKeys: selectedRows,
                                    }}
                                    columns={linkCaseColumns}
                                    dataSource={
                                        paneState?.linkCaseData ||
                                        []
                                    }
                                />
                            </Col>
                        </Row>
                        </div>

                    ) : null}
                    <div className="save-interaction-error">
                        {paneState.errorLinkCase}
                    </div>
                <div
                    className="d-flex justify-content-between"
                    style={{ marginTop: '3.5rem' }}
                >
                    <div className="bottom-buttons">
                        {createPrivileges && (
                                            <Button
                                                type="primary"
                                                onClick={handleLinkCase}
                                            >
                                                {linkCaseCondition()
                                                    ? 'Reset Case'
                                                    : 'Link Case'}
                                            </Button>
                        )}
                        {paneState.category !== 'Select Category' &&
                            paneState.subCategoryOne !== 'Select Category 1' &&
                            paneState.subCategoryTwo !== 'Select Category 2' &&
                            isSaveVisible && (
                                // paneState.interactionTags.length > 0 &&
                                // uniphored &&
                                <Button
                                    style={{
                                        background: '#52c41a',
                                        border: 'none',
                                    }}
                                    type="primary"
                                    onClick={() => {
                                                    handleToggleEdit();
                                                    handleSaveInteraction();
                                                   }}
                                >
                                    Proceed to confirm
                                </Button>
                            )}
                    </div>
                    <Text>
                        {paneState?.startTime} -{' '}
                        {interactionEndTime ? interactionEndTime : 'Loading..'}
                    </Text>
                </div>
            </div>
        );
    }
    const beforeUnloadListener = (event) => {
        event.preventDefault();
        saveInteractionBeforeUnload();
        return (event.returnValue = 'Are you sure you want to exit?');
    };
    useEffect(() => {
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
        cache.put(`showNotes`, "true")
        setIsSaveVisible(false);
        setDisableCategory(false);
        setIsShowSaveManualInteractionButton(false);
    };

    const handleChatId = (e) => {
       const text = e.target.value || '';
       const chatRegexPattern = RegExp('^[a-zA-Z0-9_+-]*$');
       if(e.target.value?.length < 41)
       {
        if(chatRegexPattern.test(text))
        {
            setChatId(e.target.value.replace(/\s/g, ''));
            setChatIdErrorMessage('')
        }
        else
        {
            setChatIdErrorMessage('special characters are not allowed')
        }
       }
    }

    useEffect(() => {
        if (interactionId !== '') {
            //condition to avoid popup if interaction id is not present
            window.addEventListener('beforeunload', beforeUnloadListener, {
                capture: true,
            });
        }
        MessageBus.subscribe(
            INTERACTION_AUTO_SAVE_INITIATE,
            INTERACTION_AUTO_SAVE_INITIATE,
            saveInteraction
        );
        sessionStorage.setItem('ghostCall', false);

        return () => {
            MessageBus.unsubscribe(INTERACTION_AUTO_SAVE_INITIATE);
        };
    }, []);
    useEffect(() => {
        if (!isEdit) {
            const endTime = moment
                .tz(moment().format(), 'America/New_York')
                .format('hh:mm:ss a');
            updateInteraction({ endTime: endTime, save: !isEdit });
            setInteractionEndTime(endTime);
        } else {
            updateInteraction({ endTime: null, save: !isEdit });
            setInteractionEndTime(null);
        }
    }, [isEdit]);

    useEffect(() => {
        updateInteraction({
            descriptionHTML:
                messages.map((obj) => obj.msg).join('<br/>') +
                paneState.descriptionHTML,
        });
    }, [messages]);

    useEffect(() => {
        if (uniphored && uniErr === false) {
            setUniphoreAcceptanceAlert(true);
        } else {
            setUniphoreAcceptanceAlert(false);
        }
    }, [uniphored]);

    useEffect(() => {
        if (uniErr) {
            setShowNotes(true);
            setDisableCategory(false);
        }
    }, [uniErr]);

    useEffect(() => {
        // initially checking for truthy value so now we checking if it is 'yes'
        if (paneState.uniphoreDataAccurate === UNIPHORE_ACCURACY.YES) {
            handleSaveInteraction(paneState.uniphoreDataAccurate);
        }
    }, [paneState.uniphoreDataAccurate]);

    useEffect(() => {
        // initially checking for truthy value so now we checking if it is 'yes'
        if (
            redirectToIH &&
            paneState?.uniphoreDataAccurate === UNIPHORE_ACCURACY.YES
        ) {
            resetModal();
            window[sessionStorage.tabId].conversationId =
                window[sessionStorage.tabId]?.sessionConversationId;
        }
    }, [redirectToIH]);

    const handlePreviewButtonClick = () => {
        if (uniphoreSessionId) {
            getUniphoreInteraction(uniphoreSessionId, true); // adding the 2nd arguement as true for preview button clicked yes.
        }
    };

    return (
        <>
            {isEdit ? (
                <Row>
                    {uniPhoreEnabled && uniphoreAcceptanceAlert && (
                        <Col
                            xs={24}
                            lg={24}
                            style={{ padding: '16px 24px 0 24px' }}
                        >
                            {/* UNIPHORE DATA ALERT */}
                            <Alert
                                description="Is the primary reason for the call accurate?"
                                type="success"
                                action={
                                    <Space>
                                        <Button
                                            size="small"
                                            type="primary"
                                            onClick={() =>
                                                handleUniphoreAccuracy(
                                                    UNIPHORE_ACCURACY.YES
                                                )
                                            }
                                        >
                                            Yes, Submit Interaction
                                        </Button>
                                        <Button
                                            size="small"
                                            type="ghost"
                                            onClick={() =>
                                                handleUniphoreAccuracy(
                                                    UNIPHORE_ACCURACY.ALMOST
                                                )
                                            }
                                        >
                                            Almost Accurate
                                        </Button>
                                        <Button
                                            size="small"
                                            danger
                                            type="ghost"
                                            onClick={() =>
                                                handleUniphoreAccuracy(
                                                    UNIPHORE_ACCURACY.NO
                                                )
                                            }
                                        >
                                            No
                                        </Button>
                                    </Space>
                                }
                            />
                            {paneState.saveInteractionError !== '' && (
                                <div className="save-interaction-error">
                                    {paneState.saveInteractionError}
                                </div>
                            )}
                        </Col>
                    )}

                    <Col
                        xs={24}
                        lg={uniPhoreEnabled ? 12 : 24}
                        style={{
                            padding: '16px 24px',
                        }}
                    >
                        {/* CATEGORIES */}
                        <div className="d-flex flex-row justify-content-between align-items-center w-100">
                            <div className="select-row">
                                <Select
                                    value={paneState.category}
                                    disabled={
                                        uniPhoreEnabled
                                            ? disableCategory
                                                ? true
                                                : false
                                            : false
                                    }
                                    onChange={manageCategory}
                                    style={{ width: 160 }}
                                >
                                    {interactionCategories.length > 0 &&
                                        interactionCategories.map((option) => (
                                            <Select.Option
                                                value={option.name}
                                                key={shortid.generate()}
                                            >
                                                {option.name}
                                            </Select.Option>
                                        ))}
                                </Select>
                                {paneState.category !== 'Select Category' && (
                                    <Select
                                        value={paneState.subCategoryOne}
                                        disabled={
                                            uniPhoreEnabled
                                                ? disableCategory
                                                    ? true
                                                    : false
                                                : false
                                        }
                                        onChange={(value) =>
                                            updateInteraction({
                                                subCategoryOne: value,
                                                subCategoryTwo:
                                                    initialInteractionState.subCategoryTwo,
                                            })
                                        }
                                        style={{ width: 200 }}
                                    >
                                        {interactionCategories
                                            .find(
                                                (c) =>
                                                    c.name ===
                                                    paneState.category
                                            )
                                            ?.categories.map((option) => (
                                                <Select.Option
                                                    value={option.name}
                                                    key={shortid.generate()}
                                                >
                                                    {option.name}
                                                </Select.Option>
                                            ))}
                                    </Select>
                                )}
                                {paneState.subCategoryOne !==
                                    'Select Category 1' && (
                                    <Select
                                        value={paneState.subCategoryTwo}
                                        onChange={(value) =>
                                            updateInteraction({
                                                subCategoryTwo: value,
                                            })
                                        }
                                        disabled={
                                            uniPhoreEnabled
                                                ? disableCategory
                                                    ? true
                                                    : false
                                                : false
                                        }
                                        style={{ width: 200 }}
                                    >
                                        {interactionCategories
                                            .find(
                                                (c) =>
                                                    c.name ===
                                                    paneState.category
                                            )
                                            ?.categories.find(
                                                (sco) =>
                                                    sco.name ===
                                                    paneState.subCategoryOne
                                            )
                                            ?.categories.map((option) => (
                                                <Select.Option
                                                    value={option.name}
                                                    key={shortid.generate()}
                                                >
                                                    {option.name}
                                                </Select.Option>
                                            ))}
                                    </Select>
                                )}

                                { // chat id for non uniphore interaction and non voice
                                !uniPhoreEnabled && showChatIdField &&
                                <div><Input placeholder="Enter Chat ID" value={chatId} onChange={handleChatId} />
                                <br />
                                {chatIdErrorMessage !== '' && <span style={{color:'red',fontSize:'10px'}}>{chatIdErrorMessage}</span>}</div>
                                }

                                {interactionCategories.length === 0 && (
                                    <div className="save-interaction-error">
                                        Error loading categories or
                                        subcategories.
                                    </div>
                                )}
                            </div>
                        </div>
                    </Col>
                    {uniPhoreEnabled && (
                        <Col
                            xs={24}
                            lg={12}
                            style={{
                                padding: '16px 24px 0 24px',
                            }}
                        >
                            {/* NORMAL TAGS */}

                            <div className="uniphore-tag-container">
                                <Select
                                    mode="tags"
                                    style={{
                                        width: '100%',
                                        marginBottom: '16px',
                                    }}
                                    placeholder="Start typing to create tag"
                                    onChange={handleInteractionTags}
                                    defaultValue={paneState.interactionTags}
                                    tagRender={tagRender}
                                >
                                    {normalIteractionTags}
                                </Select>
                            </div>
                        </Col>
                    )}

                    {uniPhoreEnabled ? (
                        showNotes && (
                            <Col
                                xs={24}
                                lg={uniPhoreEnabled ? 12 : 24}
                                style={{
                                    padding: '0 24px ',
                                }}
                            >
                                {/* NOTES WITH UNIPHORE ENABLED */}
                                {/* {getHeaderBar()} */}

                                {/* <Row style={{ width: '100%' }}>
                                <Col sm={24}>
                                    <Input
                                        placeholder="Enter Interaction Subject"
                                        onChange={(e) =>
                                            updateInteraction({
                                                subject: e.target.value,
                                            })
                                        }
                                        value={paneState.subject}
                                    />
                                </Col>
                            </Row> */}
                                {getInteractionNotes()}
                            </Col>
                        )
                    ) : (
                        <Col
                            xs={24}
                            lg={uniPhoreEnabled ? 12 : 24}
                            style={{
                                padding: '0 24px ',
                            }}
                        >
                            {/* NOTES WITH UNIPHORE DISABLED */}

                            {getInteractionNotes()}
                        </Col>
                    )}

                    {uniPhoreEnabled && (
                        <Col
                            xs={24}
                            lg={showNotes ? 12 : 24}
                            style={{
                                background: '#f3f3f3',
                                padding: '24px',
                            }}
                        >
                            {/* UNIPHORE TAGS AND SUMMARY */}
                            {uniErr ? (
                                <div className="uniphore-error">
                                    <div>
                                        <RobotOutlined
                                            style={{
                                                fontSize: '32px',
                                                marginBottom: '24px',
                                            }}
                                        />
                                    </div>
                                    {/* <p>No uniphore interactions found!</p> */}
                                    <p style={{ color: 'red' }}>
                                        {uniphoreError}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="uniphore-tag-container">
                                        {uniphoreData?.uniphoreTags?.map(
                                            (tag, index) => {
                                                return (
                                                    <div>
                                                        <Tag
                                                            onClose={(e) => {
                                                                e.preventDefault();
                                                                const newTags = [
                                                                    ...uniphoreData?.uniphoreTags,
                                                                ];
                                                                newTags?.splice(
                                                                    index,
                                                                    1
                                                                );
                                                                handleUniphoreData(
                                                                    'uniphoreTags',
                                                                    newTags
                                                                );
                                                            }}
                                                            key={index}
                                                        >
                                                            {tag}
                                                        </Tag>
                                                    </div>
                                                );
                                            }
                                        )}
                                    </div>
                                    <div className="uniphore-timeline">
                                        <div className="call-summary">
                                            <Text>Call Summary</Text>
                                            <Text>
                                                {paneState?.startTime} -{' '}
                                                {interactionEndTime
                                                    ? interactionEndTime
                                                    : 'Loading..'}
                                            </Text>
                                        </div>
                                        <div className="uniphore-call-summary-details">
                                            {uniphoreData?.uniphoreSummary &&
                                            uniphoreData?.uniphoreSummary
                                                ?.length ? (
                                                    <>
                                                        {UniphoreIssueData && renderSummary(UniphoreIssueData)}
                                                        {UniphoreTroubleShootingData && renderSummary(UniphoreTroubleShootingData)}
                                                        {UniphoreResolutionData && renderSummary(UniphoreResolutionData)}
                                                        {UniphoreCustomerName && renderSummary(UniphoreCustomerName)}
                                                        {UniphoreCTN && renderSummary(UniphoreCTN)}
                                                    </>
                                            ) : (
                                                <>
                                                    <div className="uniphore-error">
                                                        <div>
                                                            <RobotOutlined
                                                                style={{
                                                                    fontSize:
                                                                        '32px',
                                                                    marginBottom:
                                                                        '24px',
                                                                }}
                                                            />
                                                        </div>
                                                        <p>
                                                            Uniphore
                                                            interactions will be
                                                            updated as soon as
                                                            the call ends.
                                                        </p>

                                                        <small>
                                                            Interaction can only
                                                            be saved once the
                                                            call ends !
                                                        </small>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                        }}
                                    >
                                        <Modal
                                            title="Are you sure you want to save a manual interaction?"
                                            open={
                                                isModalSaveManualInteractionVisible
                                            }
                                            onCancel={
                                               () => setIsSaveManualInteractionModalVisible(false)
                                            }
                                            footer={[
                                                <Button
                                                    key="submit"
                                                    type="primary"
                                                    onClick={
                                                        handleSaveManualInteractionYes
                                                    }
                                                >
                                                    Yes
                                                </Button>,
                                                <Button
                                                    key="back"
                                                    onClick={
                                                        handleSaveManualInteractionRetry
                                                    }
                                                    loading={
                                                        saveManualIteractionButtonLoading
                                                    }
                                                >
                                                    No, Retry
                                                </Button>,
                                            ]}
                                        >
                                            <p>
                                                We have not
                                                received a
                                                summary from
                                                Uniphore yet.
                                                This could be
                                                due to some
                                                latency or it is
                                                not available.
                                                Are you sure you
                                                want to abandon
                                                Uniphore and
                                                save a manual
                                                interaction?
                                            </p>
                                        </Modal>
                                        {
                                            !uniphored && (
                                                <Button
                                                onClick={
                                                    handlePreviewButtonClick
                                                }
                                                style={{
                                                    marginTop: '24px',
                                                    backgroundColor:uniphorePreviewed ? "lightgray" : "#52C41B",
                                                    textDecoration:'none',
                                                    color:'white'
                                                }}
                                                className="previewButton"
                                                disabled={
                                                    uniphorePreviewed
                                                }
                                            >
                                                Preview
                                            </Button>
                                            )
                                        }
                                        {isShowSaveManualInteractionButton && (
                                            <Button
                                                type="primary"
                                                onClick={
                                                    showSaveManualInteractionModal
                                                }
                                                style={{
                                                    marginTop:
                                                        '24px',
                                                }}
                                            >
                                                Save Manual
                                                Interaction
                                            </Button>
                                        )}
                                        {uniphorePreviewed && !uniphored && <div style={{marginLeft:'auto'}}>
                                            This is a preview - Content subject to change.
                                        </div>}

                                    </div>
                                </>
                            )}
                        </Col>
                    )}
                </Row>
            ) : (
                <Row>
                    <Col
                        xs={24}
                        lg={uniPhoreEnabled ? 12 : 24}
                        style={{ padding: '24px' }}
                    >
                        <div className="d-flex flex-row">
                            <Space
                                direction="vertical"
                                size="middle"
                                style={{ width: '100%' }}
                            >
                                {/* {getHeaderBar()} */}
                                <div>
                                    <Space size={10}>
                                        {paneState.category && (
                                            <Tag
                                                color="#F6FFED"
                                                className="stat-tab"
                                            >
                                                {paneState.category}
                                            </Tag>
                                        )}

                                        {paneState.subCategoryOne && (
                                            <Tag
                                                color="#E6F7FF"
                                                className="stat-tab"
                                            >
                                                {paneState.subCategoryOne}
                                            </Tag>
                                        )}
                                        {paneState.subCategoryTwo && (
                                            <Tag
                                                color="#E6F7FF"
                                                className="stat-tab"
                                            >
                                                {paneState.subCategoryTwo}
                                            </Tag>
                                        )}
                                        { // chat id for non uniphore interaction and non voice
                                            !uniPhoreEnabled && showChatIdField && <Input placeholder="Enter Chat ID" value={chatId} onChange={handleChatId} disabled/>
                                        }
                                    </Space>
                                    <hr
                                        style={{
                                            width: '100%',
                                            marginTop: 10,
                                            marginBottom: 0,
                                        }}
                                        color="#dddddd"
                                        noshade
                                    />
                                </div>
                                {paneState?.interactionTags.length > 0 && (
                                    <div className="uniphore-tag-container">
                                        {paneState?.interactionTags.length >
                                            0 &&
                                            paneState.interactionTags.map(
                                                (item, index) => {
                                                    return (
                                                        <div>
                                                            <Tag
                                                                key={index}
                                                                color="success"
                                                            >
                                                                {item}
                                                            </Tag>
                                                        </div>
                                                    );
                                                }
                                            )}
                                        <hr
                                            style={{
                                                width: '100%',
                                                marginTop: 0,
                                                marginBottom: 0,
                                            }}
                                            color="#dddddd"
                                            noshade
                                        />
                                    </div>
                                )}

                                {/* <Row>
                            <Col xs={3} className="confirmpage-heading">
                                Subject:
                            </Col>
                            <Col xs={21} className="confirmpage-text">
                                {paneState.subject}
                            </Col>
                        </Row> */}
                                <Row>
                                    <Col
                                        xs={24}
                                        className="confirmpage-heading"
                                    >
                                        Description
                                    </Col>
                                    <div
                                        style={{
                                            width: '100%',
                                            height: '16rem',
                                            overflowY: 'scroll',
                                        }}
                                        xs={24}
                                        className="confirmpage-text"
                                        dangerouslySetInnerHTML={{
                                            __html: paneState.descriptionHTML,
                                        }}
                                    ></div>
                                </Row>
                                <div className="d-flex flex-row align-items-center justify-content-between action-buttons">
                                    <div
                                        style={{
                                            display: 'flex',
                                            width: '100%',
                                            justifyContent: 'flex-start',
                                            alignItems: 'center',
                                            gap: '1rem',
                                        }}
                                    >
                                        <div>
                                            <Button
                                                type="default"
                                                onClick={() => {
                                                    handleToggleEdit();
                                                    updateInteraction({
                                                        finalStep: false,
                                                        saved: false,
                                                    });
                                                    resetInteractionTitle();
                                                }}
                                            >
                                                Edit
                                                <EditOutlined />
                                            </Button>
                                        </div>
                                    </div>
                                    <Text>
                                        {paneState?.startTime} -{' '}
                                        {interactionEndTime
                                            ? interactionEndTime
                                            : 'Loading..'}
                                    </Text>
                                </div>
                                {paneState.saveInteractionError !== '' && (
                                    <div className="save-interaction-error">
                                        {paneState.saveInteractionError}
                                    </div>
                                )}
                            </Space>
                        </div>
                    </Col>
                    {uniPhoreEnabled && (
                        <Col
                            xs={24}
                            lg={12}
                            style={{
                                background: '#f3f3f3',
                                padding: '24',
                            }}
                        >
                            {/* <div
                                className="uniphore-tag-container"
                                style={{ marginBottom: '8px' }}
                            >
                                {paneState?.interactionTags.length > 0 &&
                                    paneState.interactionTags.map(
                                        (item, index) => {
                                            return (
                                                <div>
                                                    <Tag
                                                        key={index}
                                                        color="success"
                                                    >
                                                        {item}
                                                    </Tag>
                                                </div>
                                            );
                                        }
                                    )}
                            </div> */}
                            {uniErr ? (
                                <div className="uniphore-error">
                                    <div>
                                        <RobotOutlined
                                            style={{ fontSize: '32px' }}
                                        />
                                    </div>
                                    <p style={{ color: 'red' }}>
                                        {uniphoreError}
                                    </p>
                                </div>
                            ) : (
                                getUniphoreInteractionDetails()
                            )}
                        </Col>
                    )}
                </Row>
            )}
        </>
    );
}

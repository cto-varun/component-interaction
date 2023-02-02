/* eslint-disable complexity */
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Modal, Row, Col, Tabs, Button, Typography, notification } from 'antd';
import {
    CheckCircleOutlined,
    MinusOutlined,
    CloseOutlined,
    ExclamationCircleOutlined,
    AudioOutlined,
} from '@ant-design/icons';
import Feedback from '@ivoyant/component-feedback-tool';

import 'react-quill/dist/quill.snow.css';

import moment from 'moment';
import { cache } from '@ivoyant/component-cache';
import { MessageBus } from '@ivoyant/component-message-bus';
import InteractionModal from './InteractionModal';
import { UNIPHORE_ACCURACY } from './utils';

const { Paragraph } = Typography;

const { confirm } = Modal;
const CALL_END_EVENT = 'SESSION.CALL.END'; // for handling the call end event trigerred by ctihandler.js file from web sockets

import './styles.css';

export default function Interaction(props) {
    const history = useHistory();

    const {
        properties,
        interactionTags,
        defaultInteractionData,
        feedbackInfo,
    } = props;
    const interactionState = cache.get('interaction');
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
        subCategoryOne:
            defaultInteractionData?.subCategory1 || 'Select Category 1',
        subCategoryTwo:
            defaultInteractionData?.subCategory2 || 'Select Category 2',
        descriptionText: '',
        descriptionHTML: '',
        saveInteractionError: '',
        submitInteractionError: '',
        finalStep: false,
        linkCaseData: [],
        linkCaseId: null,
        errorLinkCase: false,
        interactionTags: [],
        autoSubmit: false,
    };

    const getNewPaneState = (interactionState) => {
        const newPaneState = {
            ...initialInteractionState,
            startTime: moment
                .tz(moment().format(), 'America/New_York')
                .format('hh:mm:ss a'),
            ...(interactionState?.authenticated === false &&
            interactionState?.unauthenticatedCaller
                ? interactionState.unauthenticatedCaller
                : {}),
        };

        return newPaneState;
    };

    // Added cache data to save the state while switching to pages.
    const [tabCount, setTabCount] = useState(1);
    const uniphoreCacheData = cache.get('uniphoreData');
    const [uniphoreData, setUniphoreData] = useState( 
                                    uniphoreCacheData !== undefined ? uniphoreCacheData : {
        category: defaultInteractionData?.category || 'Select Category',
        subCategory1:
            defaultInteractionData?.subCategory1 || 'Select Category 1',
        subCategory2:
            defaultInteractionData?.subCategory2 || 'Select Category 2',
    });
    const [uniphoreError, setUniphoreError] = useState('');
    const [uniErr, setUniErr] = useState(false);
    const [isSaveVisible, setIsSaveVisible] = useState(cache.get(`saveVisible`) === "true" ? true : false);
    const uniPhoreEnabled =
        window[sessionStorage.tabId].COM_IVOYANT_VARS?.featureFlags?.uniphore &&
        uniphoreSessionId && language !== 'Spanish';

    /* reset when push */
    // const uniPhoreEnabled = true;
    const [uniphored, setUniphored] = useState(cache.get(`uniphored`) === "true" ? true : false);
    const [uniphorePreviewed, setUniphorePreviewed] = useState(cache.get(`uniphorePreviewed`) === "true" ? true : false)

    const [submitButtonLoading, setSubmitButtonLoading] = useState(false);
    const [uniphoreAcceptanceAlert, setUniphoreAcceptanceAlert] = useState(
        undefined
    );

    const [interactionTitle, setInteractionTitle] = useState(
        interactionState?.title || (
            // <div className="save-interaction-header">
            //     Interaction ID - IC6VXKM <CopyOutlined />
            // </div>
            <div className="d-flex justify-content-between">
                <Paragraph
                    style={{ marginBottom: '0', display: 'flex' }}
                    copyable={{ text: interactionId }}
                >
                    <div>
                        {' '}
                        <AudioOutlined style={{ color: '#52C41A' }} /> &nbsp;
                        Interaction ID : {interactionId}
                    </div>
                </Paragraph>
                <span style={{ paddingRight: '24px' }}>
                    CTN : {cache.get('interaction')?.ctn}
                </span>
            </div>
        )
    );

    const [clickCounter, setClickCounter] = useState(0);

    const [submitInteractionError, setSubmitInteractionError] = useState(
        interactionState?.submitInteractionError || ''
    );

    const [activeKey, setActiveKey] = useState(
        interactionState?.activeKey || 'newTab 1'
    );

    const [
        saveManualIteractionButtonLoading,
        setSaveManualIteractionButtonLoading,
    ] = useState(false);

    const [panes, setPanes] = useState(
        Object.keys(interactionState?.interactions || []).length > 0
            ? Object.values(interactionState.interactions)
            : [getNewPaneState(interactionState)]
    );

    const updateTitle = (newTitle) => {
        const currentInteractionState = cache.get('interaction');
        if (currentInteractionState) {
            currentInteractionState.title = newTitle;
            cache.put('interaction', currentInteractionState);
        }
        setInteractionTitle(newTitle);
    };

    const updateActiveKey = (newActiveKey) => {
        const currentInteractionState = cache.get('interaction');
        if (currentInteractionState) {
            currentInteractionState.activeKey = newActiveKey;
            cache.put('interaction', currentInteractionState);
        }
        setActiveKey(newActiveKey);
    };

    const updatePanes = (newPanes) => {
        const currentInteractionState = cache.get('interaction');

        if (currentInteractionState) {
            currentInteractionState.interactions = {};
            newPanes.forEach(
                (p) => (currentInteractionState.interactions[p.key] = p)
            );
            cache.put('interaction', currentInteractionState);
        }

        setPanes(newPanes);
    };

    const updatePane = (paneKey, pane) => {
        const currentInteractionState = cache.get('interaction');
        if (paneKey && pane && currentInteractionState) {
            currentInteractionState.interactions[paneKey] = pane;
            cache.put('interaction', currentInteractionState);
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
            feedbackWorkflow,
        },
    } = props;

    const resetAll = () => {
        setPanes([getNewPaneState(cache.get('interaction'))]);
    };

    const updateVisibility = (event, type, payload) => {
        if (uniPhoreEnabled) {
            if (payload?.body?.uniphoreSessionId) {
                interactionState.uniphoreSessionId =
                    payload.body.uniphoreSessionId;
            }
            getUniphoreInteraction(interactionState?.uniphoreSessionId);
        }
    };

    useEffect(() => {
        MessageBus.subscribe(CALL_END_EVENT, CALL_END_EVENT, updateVisibility);

        MessageBus.subscribe(
            'saveInteraction.'.concat(props.events.interactionStart),
            props.events.interactionStart,
            resetAll,
            {}
        );
        return () => {
            MessageBus.unsubscribe(
                'saveInteraction.'.concat(props.events.interactionStart)
            );
            MessageBus.unsubscribe(CALL_END_EVENT);
        };
    }, []);

    const handleUniphoreData = (successStates, errorStates, isPreview = false) => (
        subscriptionId,
        topic,
        eventData,
        closure
    ) => {
        const isSuccess = successStates.includes(eventData.value);
        const isError = errorStates.includes(eventData.value);
        if (isSuccess || isError) {
            if (isSuccess && eventData?.event?.data?.data) {
                const unidata = eventData.event.data.data;

                // ONLY LAST 4 DIGITS OF CTN SHOULD BE DISPLAYED
                const filteredSummary = unidata?.uniphoreSummary?.map((us) => {
                    if(us.label === 'CTN')
                    {
                        const ctnBody = us.body[0];
                        return {
                            label : us.label,
                            body : [ctnBody?.slice(ctnBody?.length - 4)]
                        }
                    }
                    return us;
                })
                const data = {...unidata, uniphoreSummary : filteredSummary }
                data['uniphoreDataAccurate'] = data['uniphoreDataAccurate']
                    ? data['uniphoreDataAccurate']
                    : UNIPHORE_ACCURACY?.YES ;
                // : true;
                cache.put('uniphoreData', data);
                setUniphoreData(data);
                setUniErr(false);
                setIsSaveVisible(true);
                if(!isPreview){
                    setIsSaveVisible(true);
                    cache.put(`saveVisible`, "true");
                }
                else if(isPreview)
                {
                    setUniphorePreviewed(true);
                    cache.put(`uniphorePreviewed`,"true")
                }
            }
            if (isError) {
                setUniphoreError(
                    eventData?.event?.data?.message ||
                        'Uniphore is currently down. Please fill out the interaction form!'
                );
                setUniErr(true);
            }
            setSaveManualIteractionButtonLoading(false);
            if(!isPreview){
                setUniphored(true);
                cache.put(`uniphored`, "true");
            }
            MessageBus.unsubscribe(subscriptionId);
        }
    };
    useEffect(() => {
        if (
            panes[0].category === 'Select Category' ||
            panes[0].category === defaultInteractionData?.category
        ) {
            updateCategory(uniphoreData);
        }
        if (
            panes[0].subCategoryOne === 'Select Category 1' ||
            panes[0].subCategoryOne === defaultInteractionData?.subCategory1
        ) {
            updateSubCategoryOne(uniphoreData);
        }
        if (
            panes[0].subCategoryTwo === 'Select Category 2' ||
            panes[0].subCategoryTwo === defaultInteractionData?.subCategory2
        ) {
            updateSubCategoryTwo(uniphoreData);
        }
    }, [uniphoreData]);

    const updateCategory = (data, tabIndex = panes[0].key) => {
        let panesCopy = panes.slice();
        let paneIndex = panesCopy.findIndex((pane) => pane.key === tabIndex);
        panesCopy[paneIndex].category = data.category;
        updatePanes(panesCopy);
    };
    const updateSubCategoryOne = (data, tabIndex = panes[0].key) => {
        let panesCopy = panes.slice();
        let paneIndex = panesCopy.findIndex((pane) => pane.key === tabIndex);
        panesCopy[paneIndex].subCategoryOne = data.subCategory1;
        updatePanes(panesCopy);
    };
    const updateSubCategoryTwo = (data, tabIndex = panes[0].key) => {
        let panesCopy = panes.slice();
        let paneIndex = panesCopy.findIndex((pane) => pane.key === tabIndex);
        panesCopy[paneIndex].subCategoryTwo = data.subCategory2;
        updatePanes(panesCopy);
    };

    const getUniphoreInteraction = (sessionId, isPreview) => {
        const {
            workflow,
            datasource,
            responseMapping,
            successStates,
            errorStates,
        } = uniphoreWorkflow;
        setSaveManualIteractionButtonLoading(true);
        const registrationId = workflow.concat('.').concat(ban);
        MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
            header: {
                registrationId: registrationId,
                workflow: workflow,
                eventType: 'INIT',
            },
        });
        MessageBus.subscribe(
            registrationId,
            'WF.'.concat(workflow).concat('.STATE.CHANGE'),
            handleUniphoreData(successStates, errorStates, isPreview)
        );
        MessageBus.send('WF.'.concat(workflow).concat('.SUBMIT'), {
            header: {
                registrationId: registrationId,
                workflow: workflow,
                eventType: 'SUBMIT',
            },
            body: {
                datasource: datasources[datasource],
                request: {
                    params: {
                        sessionId: sessionId || uniphoreSessionId,
                        dataselector: 'all',
                    },
                },
                responseMapping,
            },
        });
    };

    const handleResponse = (successStates, errorStates) => (
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
                resetModal();
                window[sessionStorage.tabId].conversationId =
                    window[sessionStorage.tabId]?.sessionConversationId;
                if (sessionStorage.getItem('ghostCall') === 'true') {
                    notification['success']({
                        message: 'Success!',
                        description:
                            'Ghost caller interaction succesfully submitted!',
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
            MessageBus.unsubscribe(subscriptionId);
        }
    };

    const handleSubmitInteraction = () => {
        const {
            workflow,
            datasource,
            successStates,
            errorStates,
            responseMapping,
        } = submitInteractionWorkflow;
        const interactionState = cache.get('interaction');
        const {
            interactionId = '',
            ctn = '',
            ban = '',
            agentId = '',
            channel = interactionChannel[0],
        } = interactionState || {};
        const submitInteractionObject = {
            interactionId: interactionId,
        };

        if (window[window.sessionStorage?.tabId].timerSeconds) {
            submitInteractionObject.customerCallEndTime = moment(
                interactionState?.startTime
            )
                .add(
                    window[window.sessionStorage?.tabId].timerSeconds,
                    'seconds'
                )
                .format('YYYY-MM-DD HH:mm:ssZZ');
        }

        setSubmitButtonLoading(true);
        const submitEvent = 'SUBMIT';
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
            handleResponse(successStates, errorStates)
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
                        body: submitInteractionObject,
                    },
                    responseMapping,
                },
            }
        );
    };

    const resetInteractionTitle = () =>
        updateTitle(
            <div className="d-flex justify-content-between">
                <Paragraph
                    style={{ marginBottom: '0', display: 'flex' }}
                    copyable={{ text: interactionId }}
                >
                    <div>
                        {' '}
                        <AudioOutlined style={{ color: '#52C41A' }} /> &nbsp;
                        Interaction ID : {interactionId}
                    </div>
                </Paragraph>
                <span style={{ paddingRight: '24px' }}>
                    CTN : {cache.get('interaction')?.ctn}
                </span>
            </div>
        );

    const onChange = (newActiveKey) => {
        updateActiveKey(newActiveKey);
    };

    const remove = (targetKey) => {
        let activeKeyCopy = activeKey;
        let lastIndex;
        panes.forEach((pane, i) => {
            if (pane.key === targetKey) {
                lastIndex = i - 1;
            }
        });
        const panesCopy = panes
            .slice()
            .filter((pane) => pane.key !== targetKey);
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
        updateTitle(
            <Row>
                <Col xs={2}>
                    <CheckCircleOutlined
                        style={{
                            fontSize: '35px',
                            height: '50px',
                            width: '50px',
                            color: '#52C41A',
                        }}
                    />
                </Col>
                <Col xs={21}>
                    <Row>
                        <Col xs={24} className="title-heading-first-line">
                            <Paragraph
                                style={{ marginBottom: '0', display: 'flex' }}
                                copyable={{ text: interactionId }}
                            >
                                <div>Interaction ID : {interactionId}</div>
                            </Paragraph>
                        </Col>
                        <Col xs={24} className="title-heading-text">
                            Interaction has successfully saved. Now you can
                            create a case or submit to interaction history.{' '}
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }

    const resetModal = () => {
        if (!cache.get('contact')) {
            cache.remove('interaction');
        }
        props.setSaveInteractionModalVisible(false);
        resetInteractionTitle();
        setSubmitInteractionError('');
        setActiveKey('newTab 1');
        setPanes([]);
        if (cache.get('contact')) {
            MessageBus.send('SAVE.DISPLAY.INTERACTION');
        } else {
            window[window.sessionStorage?.tabId].dispatchRedux('DATA_REQUEST', {
                dashboardID: 'history-board',
                datasources: ['360-interaction-history'],
            });
        }

        if (props.events && props.events.interactionSubmitted) {
            MessageBus.send(props.events.interactionSubmitted, {
                header: {
                    source: 'interaction',
                    event: props.events.interactionSubmitted,
                },
                body: {
                    message: 'Interaction '
                        .concat(interactionId)
                        .concat(' has been submitted.'),
                },
            });
        }
        if (!cache.get('contact'))
            setTimeout(function () {
                history.push('/dashboards/history-board#interactionhistory');
            }, 2000);

        if (cache.get('contact')) cache.remove('contact');
        if (cache.get('ctn')) cache.remove('ctn');
    };

    const changeTabTitle = (tabIndex, title) => {
        let panesCopy = panes.slice();
        let paneIndex = panesCopy.findIndex((pane) => pane.key === tabIndex);
        panesCopy[paneIndex].title = title;
        updatePanes(panesCopy);
    };

    const updateSaved = (tabIndex) => {
        let panesCopy = panes.slice();
        let paneIndex = panesCopy.findIndex((pane) => pane.key === tabIndex);
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
        let paneIndex = panes.findIndex((pane) => pane.key === targetKey);
        if (action === 'add') add();
        else if (action === 'remove') {
            if (!panes[paneIndex].saved) {
                confirm({
                    okText: 'Confirm',
                    icon: <ExclamationCircleOutlined />,
                    content:
                        'This action is not saved yet. Do you still want to close this ?',
                    onOk() {
                        remove(targetKey);
                    },
                    onCancel() {
                        console.log('Cancel');
                    },
                });
            } else remove(targetKey);
        }
    };

    function modalFooter() {
        let footer = [];
        let submitButton = (
            <Button
                className="save-interaction-btn"
                type="primary"
                loading={submitButtonLoading}
                onClick={handleSubmitInteraction}
            >
                Submit Interaction
            </Button>
        );
        let closeButton = (
            <Button
                style={{
                    background: '#D9D9D9',
                    borderRadius: '2px',
                }}
                type="default"
                // onClick={() => resetModal()} - Changed Close to Minimize
                onClick={() => minimizeModal()}
            >
                Close
            </Button>
        );

        let reloadButton = (
            <Button
                style={{
                    background: '#D9D9D9',
                    borderRadius: '2px',
                    marginRight: '4px',
                }}
                disabled={clickCounter > 1 ? true : false}
                type={clickCounter > 1 ? '' : 'primary'}
                onClick={() => {
                    getUniphoreInteraction(uniphoreSessionId);
                    setClickCounter(clickCounter + 1);
                }}
            >
                Retry
            </Button>
        );
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

    const getIcon = (saved) => {
        return saved ? (
            <CloseOutlined />
        ) : (
            <div
                style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: '#f28c00',
                }}
            ></div>
        );
    };

    return (
        <>
            <Feedback
                feedbackWorkflow={feedbackWorkflow}
                datasources={datasources}
                feedbackInfo={feedbackInfo}
            />
            <Modal
                className="save-interaction-modal"
                title={interactionTitle}
                open={visible}
                onCancel={() => {
                    minimizeModal();
                }}
                closeIcon={<MinusOutlined />}
                width={uniPhoreEnabled ? 1200 : 750}
                footer={modalFooter()}
                forceRender={true}
                centered
            >
                <div
                //type={showMultipleTabs ? 'editable-card' : ''}
                //onChange={onChange}
                // activeKey={activeKey}
                // onEdit={onEdit}
                >
                    {panes.map((pane) => (
                        <div
                            //tab={pane.title}
                            key={pane.key}
                            // closable={showMultipleTabs ? pane?.closable : false}
                            // closeIcon={showMultipleTabs && getIcon(pane?.saved)}
                        >
                            <InteractionModal
                                {...props}
                                resetInteractionTitle={resetInteractionTitle}
                                changeTitle={changeTitle}
                                paneIndex={pane.key}
                                changeTabTitle={changeTabTitle}
                                updateSaved={updateSaved}
                                paneState={pane}
                                updatePaneState={updatePane}
                                uniphoreData={uniphoreData}
                                setUniphoreData={setUniphoreData}
                                uniphoreError={uniphoreError}
                                interactionTags={interactionTags}
                                uniPhoreEnabled={uniPhoreEnabled}
                                uniErr={uniErr}
                                setUniErr={setUniErr}
                                setIsSaveVisible={setIsSaveVisible}
                                isSaveVisible={isSaveVisible}
                                uniphored={uniphored}
                                setUniphored={setUniphored}
                                resetModal={resetModal}
                                handleSubmitInteraction={
                                    handleSubmitInteraction
                                }
                                getUniphoreInteraction={getUniphoreInteraction}
                                saveManualIteractionButtonLoading={
                                    saveManualIteractionButtonLoading
                                }
                                uniphoreAcceptanceAlert={
                                    uniphoreAcceptanceAlert
                                }
                                setUniphoreAcceptanceAlert={
                                    setUniphoreAcceptanceAlert
                                }
                                defaultInteractionData={defaultInteractionData}
                                uniphoreSessionId={uniphoreSessionId}
                                uniphorePreviewed={uniphorePreviewed}
                            />
                        </div>
                    ))}
                </div>

                {submitInteractionError !== '' && (
                    <div
                        className="save-interaction-error"
                        style={{ paddingLeft: '24px' }}
                    >
                        {submitInteractionError}
                    </div>
                )}
            </Modal>
        </>
    );
}

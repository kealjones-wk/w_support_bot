module.exports = {
    submitIssueModal: (channel, description) => {
        return {
            type: 'modal',
            // View identifier
            callback_id: 'submit-issue',
            title: {
                type: 'plain_text',
                text: 'Submit support issue'
            },
            blocks: [
                {
                    block_id: 'urgency_block',
                    type: 'input',
                    label: {
                        type: 'plain_text',
                        text: 'Urgency'
                    },
                    element: {
                        action_id: 'urgency',
                        type: 'static_select',
                        options: [
                            {
                                text: {
                                    type: 'plain_text',
                                    text: ':red_circle: High'
                                },
                                value: ':red_circle: high'
                            },
                            {
                                text: {
                                    type: 'plain_text',
                                    text: ':warning: Medium'
                                },
                                value: ':warning: medium'
                            },
                            {
                                text: {
                                    type: 'plain_text',
                                    text: ':exclamation: Low'
                                },
                                value: ':exclamation: low'
                            }
                        ]
                    },
                },
                {
                    block_id: 'channel_name_block',
                    type: 'input',
                    label: {
                        type: 'plain_text',
                        text: 'Channel'
                    },
                    element: {
                        action_id: 'channel_name',
                        type: 'plain_text_input',
                        initial_value: channel,
                    },
                },
                {
                    block_id: 'category_block',
                    type: 'input',
                    label: {
                        type: 'plain_text',
                        text: 'Category'
                    },
                    element: {
                        action_id: 'category',
                        type: 'static_select',
                        options: [
                            {
                                text: {
                                    type: 'plain_text',
                                    text: 'help'
                                },
                                value: 'Help'
                            },
                            {
                                text: {
                                    type: 'plain_text',
                                    text: 'review'
                                },
                                value: 'Review'
                            },
                            {
                                text: {
                                    type: 'plain_text',
                                    text: 'release'
                                },
                                value: 'release'
                            }
                        ]
                    },
                },
                {
                    block_id: 'package_name_block',
                    type: 'input',
                    label: {
                        type: 'plain_text',
                        text: 'Package'
                    },
                    element: {
                        action_id: 'package_name',
                        type: 'plain_text_input',
                    },
                    optional: true
                },
                {
                    block_id: 'pr_block',
                    type: 'input',
                    label: {
                        type: 'plain_text',
                        text: 'Pull Request link'
                    },
                    element: {
                        action_id: 'pr',
                        type: 'plain_text_input',
                    },
                    optional: true
                },
                {
                    block_id: 'description_block',
                    type: 'input',
                    label: {
                        type: 'plain_text',
                        text: 'Description'
                    },
                    element: {
                        action_id: 'description',
                        type: 'plain_text_input',
                        initial_value: description,
                        multiline: true
                    },
                },
            ],
            submit: {
                type: 'plain_text',
                text: 'Submit'
            }
        };
    },
    composeIssueDetails: ({ issueDescription, issueLink, issueDetails }) => {
        details = [];
        let description = issueDescription;
        if (issueDetails) {
            const urgency = issueDetails.urgency_block.urgency.selected_option.value;
            const package = issueDetails.package_name_block.package_name.value;
            const pr = issueDetails.pr_block.pr.value;
            const category = issueDetails.category_block.category.selected_option.value;
            description = issueDetails.description_block.description.value;
            if (urgency) {
                details.push(
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: `*Urgency:* ${urgency}`
                        }
                    },
                );
            }
            if (package) {
                details.push(
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: `*Package:* ${package}`
                        }
                    });
            }
            if (pr) {
                details.push(
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: `*Pull Request:* ${pr}`
                        }
                    },
                );
            }
            if (category) {
                details.push(
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: `*Category:* ${category}`
                        }
                    });
            }
        }
        if (description) {
            details.push(
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `*Issue description:*\n${description}`
                    }
                },
            );
        }

        if (issueLink) {
            details.push(
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `*Request link:* ${issueLink}`
                    }
                });
        }
        return details;
    },
    supportMessageForTeam: ({ user, issueDescription, issueLink, issueDetails }) => {
        let messageForTeam = [
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `Hey there  👋 @supportsquad.\n`
                }
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `*From:* <@${user}>`
                }
            },];
        return messageForTeam.concat(module.exports.composeIssueDetails({ issueDescription: issueDescription, issueDetails: issueDetails, issueLink: issueLink }));
    },
    supportIssueRequestSubmitted: (user) => {
        return [{
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `Hey there 👋 <@${user}>. We recieved your help request and we'll be with you as soon as we get a chance!`,
            },
        }];
    },
    supportIssueRequestWillBeSent: (user, issueDetails) => {
        const blocks = [{
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `Thank you for submitting your issue <@${user}>.`,
            },
        }];
        return blocks.concat(module.exports.composeIssueDetails({ issueDetails: issueDetails }));
    },
};

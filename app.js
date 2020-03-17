const { App } = require('@slack/bolt');
const payloads = require('./payloads');

const teamSupportChannel = 'cp_support';

// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  endpoints: {
    events: '/slack/events',
    commands: '/slack/commands',
    interactive: '/slack/interactive'
  }
});

app.command('/supportsquad', async ({ ack, body, context }) => {
  ack();
  try {
    await app.client.views.open({
      token: context.botToken,
      trigger_id: body.trigger_id,
      view: payloads.submitIssueModal(body.channel_name, body.text),
    });
  } catch (e) {
    console.error(e);
  }
});

// Listens to incoming messages that contain trigger words
app.message(/@supportsquad|guys|hey|hello|workaround|issue|review|failure|help/, async ({ message, context }) => {
  const botToken = context.botToken;
  const user = message.user;
  const ts = message.ts;
  const channel = message.channel;
  let issueLink = await getLink(botToken, channel, ts);
  let result = await sendSupportRequestToTeam(botToken, user, issueLink, { issueDescription: message.text });

  if (result) {
    await notifyUserAboutRequestSubmission(botToken, channel, ts, user);
  }
});

app.view('submit-issue', async ({ ack, body, view, context }) => {
  // Acknowledge the view_submission event
  ack();

  // Fetch all of the information, so we can submit issue
  const botToken = context.botToken;
  const user = body.user.id;
  const values = view.state.values;
  let ts;
  let result;
  try {
    result = await app.client.chat.postMessage({
      token: botToken,
      channel: values.channel_name_block.channel_name.value,
      blocks: payloads.supportIssueRequestWillBeSent(user, values),
    });
    ts = result.ts;
  } catch (e) {
    console.error(e);
  }

  if (result) {
    const channel = result.channel;
    let issueLink = await getLink(botToken, channel, ts);
    result = sendSupportRequestToTeam(botToken, user, issueLink, { issueDetails: values });

    if (result) {
      result = await notifyUserAboutRequestSubmission(botToken, channel, ts, user);
    }
  }
});

async function getLink(token, channel, threadTs) {
  try {
    const permalinkResult = await app.client.chat.getPermalink({
      token: token,
      channel: channel,
      message_ts: threadTs,
    });
    return permalinkResult.permalink;
  } catch (e) {
    console.error(e);
    return null;
  }
}

async function sendSupportRequestToTeam(botToken, user, issueLink, { issueDescription, issueDetails }) {
  try {
    return await app.client.chat.postMessage({
      token: botToken,
      channel: teamSupportChannel,
      blocks: payloads.supportMessageForTeam({ user: user, issueDescription: issueDescription, issueLink: issueLink, issueDetails: issueDetails }),
    });
  } catch (e) {
    console.error(e);
    return null;
  }
}

async function notifyUserAboutRequestSubmission(botToken, channel, ts, user) {
  try {
    return await app.client.chat.postMessage({
      token: botToken,
      channel: channel,
      thread_ts: ts,
      blocks: payloads.supportIssueRequestSubmitted(user),
    });
  } catch (e) {
    console.error(e);
    return null;
  }
}

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();
const { _android: android } = require('@playwright/test');
const axios = require('axios');

(async () => {
    const [device] = await android.devices();
    const rawAddress = device.serial();
    const deviceAddress = rawAddress.split(':')[0]; // Remove port if present
    console.log('====================================');
    console.log(`Device Address: ${deviceAddress}`);
    console.log('====================================');

    const HS_API_TOKEN = 'Token';

    // Start HeadSpin session
    const sessionResp = await axios.post(
        'https://api-dev.headspin.io/v0/sessions',
        {
            session_type: 'capture',
            device_address: "R5CR40C7ABV@dev-ca-tor-0-proxy-40-lin.headspin.io",
        },
        {
            headers: { Authorization: `Bearer ${HS_API_TOKEN}` }
        }
    );

    const sessionId = sessionResp.data.session_id;
    console.log(`Session started: ${sessionId}`);

    // Automation via Playwright
    console.log(`Model: ${device.model()}`);
    console.log(`Serial: ${deviceAddress}`);
    await device.screenshot({ path: 'device.png' });

    await device.shell('am force-stop com.android.chrome');
    const context = await device.launchBrowser();
    const page = await context.newPage();

    await page.goto('https://webkit.org/');
    console.log(await page.evaluate(() => window.location.href));
    await page.screenshot({ path: 'page.png' });

    await context.close();
    await device.close();

    // Stop HeadSpin session
    // await axios.post(
    //     `https://api-dev.headspin.io/v0/sessions/${sessionId}`,
    //     { active: false },
    //     {
    //         headers: { Authorization: `Bearer ${HS_API_TOKEN}` }
    //     }
    // );


    console.log(`Session stopped: ${sessionId}`);
})();

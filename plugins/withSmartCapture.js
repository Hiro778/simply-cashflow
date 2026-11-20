const { withAndroidManifest } = require('expo/config-plugins');

/**
 * Expo Config Plugin to declare the Android NotificationListenerService
 * for Simply Cashflow Smart Capture.
 */
module.exports = function withSmartCapture(config) {
  return withAndroidManifest(config, (config) => {
    const mainApplication = config.modResults.manifest.application[0];

    if (!mainApplication.service) {
      mainApplication.service = [];
    }

    const serviceName = '.smartcapture.SmartCaptureService';
    const exists = mainApplication.service.some(
      (s) => s.$ && s.$['android:name'] === serviceName
    );

    if (!exists) {
      mainApplication.service.push({
        $: {
          'android:name': serviceName,
          'android:label': 'Simply Cashflow Smart Capture',
          'android:permission': 'android.permission.BIND_NOTIFICATION_LISTENER_SERVICE',
          'android:exported': 'true',
        },
        'intent-filter': [
          {
            action: [
              {
                $: {
                  'android:name': 'android.service.notification.NotificationListenerService',
                },
              },
            ],
          },
        ],
      });
    }

    return config;
  });
};

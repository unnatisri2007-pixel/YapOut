import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { dataStore } from './server/store.js';
import { gemmaAdapter } from './server/gemma-adapter.js';
import { verificationAdapter } from './server/verification-adapter.js';
import { authManager, requireAdmin } from './server/auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // ----------------------------------------------------
  // User Authentication & Account Endpoints
  // ----------------------------------------------------

  // Public User Login
  app.post('/api/auth/login', (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const user = authManager.authenticate(email, password);
      if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid email or password.' });
      }
      const session = authManager.createSession(user);
      res.json({
        success: true,
        token: session.token,
        user: session.user,
        message: 'Successfully logged in.',
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Public User Registration: strictly grants 'user' role only
  app.post('/api/auth/register', (req: Request, res: Response) => {
    try {
      const { name, email, password, handle } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
      }
      const newUser = authManager.registerUser(name, email, password, handle);
      const session = authManager.createSession(newUser);
      res.status(201).json({
        success: true,
        token: session.token,
        user: session.user,
        message: 'Account created successfully.',
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Check Current Authentication State
  app.get('/api/auth/me', (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.json({ authenticated: false, user: null });
      }
      const token = authHeader.substring(7).trim();
      const session = authManager.validateSession(token);
      if (!session) {
        return res.json({ authenticated: false, user: null });
      }
      res.json({ authenticated: true, user: session.user });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // User Logout
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7).trim();
        authManager.revokeSession(token);
      }
      res.json({ success: true, message: 'Logged out successfully.' });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // ----------------------------------------------------
  // Dedicated Admin Authentication Endpoints
  // ----------------------------------------------------

  // Dedicated Admin Login: verifies credentials AND verifies explicit role === 'admin'
  app.post('/api/admin/login', (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Admin email and password are required.' });
      }

      const user = authManager.authenticate(email, password);
      if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid administrator credentials.' });
      }

      // Role check enforced on the server
      if (user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Forbidden: This account does not possess administrator credentials. Access to the admin portal is denied.',
        });
      }

      const session = authManager.createSession(user);
      res.json({
        success: true,
        token: session.token,
        user: session.user,
        message: 'Administrator session authenticated.',
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Dedicated Admin Session Verification Endpoint
  app.get('/api/admin/session', requireAdmin, (req: Request, res: Response) => {
    res.json({
      success: true,
      authenticated: true,
      isAdmin: true,
      user: (req as any).adminUser,
    });
  });

  // Dedicated Admin Logout Endpoint
  app.post('/api/admin/logout', (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      const adminHeader = req.headers['x-admin-token'] as string | undefined;
      const token = (authHeader && authHeader.startsWith('Bearer '))
        ? authHeader.substring(7).trim()
        : adminHeader?.trim();

      if (token) {
        authManager.revokeSession(token);
      }
      res.json({ success: true, message: 'Administrator session terminated.' });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Promote or assign user roles (Protected by requireAdmin)
  app.post('/api/admin/promote', requireAdmin, (req: Request, res: Response) => {
    try {
      const { email, role } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, error: 'Target email is required.' });
      }
      const targetRole = role === 'admin' ? 'admin' : 'user';
      const updatedUser = authManager.setUserRole(email, targetRole);
      res.json({
        success: true,
        message: `User ${email} has been granted the "${targetRole}" role.`,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role,
        },
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Secure Server-side Admin Bootstrap Endpoint
  // Allows the deployer/owner to provision or claim administrator privileges using the secret ADMIN_BOOTSTRAP_KEY
  app.post('/api/admin/bootstrap-admin', (req: Request, res: Response) => {
    try {
      const bootstrapSecret = process.env.ADMIN_BOOTSTRAP_KEY || 'yapout-secure-bootstrap-key';
      const providedKey = req.headers['x-bootstrap-key'] || req.body.bootstrapKey;

      if (!providedKey || providedKey !== bootstrapSecret) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden: Invalid bootstrap key. Only server administrators with the secret bootstrap key can invoke this endpoint.',
        });
      }

      const { email, password, name } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email and password are required.' });
      }

      const admin = authManager.bootstrapAdmin(email, password, name);
      res.json({
        success: true,
        message: `Administrator account for ${admin.email} has been successfully provisioned.`,
        user: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        },
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // ----------------------------------------------------
  // Hangout API Endpoints
  // ----------------------------------------------------

  // Get all hangouts with optional filters
  app.get('/api/hangouts', (req: Request, res: Response) => {
    try {
      const { search, category, activityType, budget, neighborhood, joinedOnly, savedOnly, createdOnly } = req.query;
      const hangouts = dataStore.getAllHangouts({
        search: search as string | undefined,
        category: category as string | undefined,
        activityType: activityType as string | undefined,
        budget: budget as string | undefined,
        neighborhood: neighborhood as string | undefined,
        joinedOnly: joinedOnly === 'true',
        savedOnly: savedOnly === 'true',
        createdOnly: createdOnly === 'true',
      });
      res.json({ success: true, count: hangouts.length, data: hangouts });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to fetch hangouts' });
    }
  });

  // Get single hangout
  app.get('/api/hangouts/:id', (req: Request, res: Response) => {
    try {
      const hangout = dataStore.getHangoutById(req.params.id);
      if (!hangout) {
        return res.status(404).json({ success: false, error: 'Hangout not found' });
      }
      res.json({ success: true, data: hangout });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Create new hangout
  app.post('/api/hangouts', (req: Request, res: Response) => {
    try {
      const { title, description, activityCategory, activityType, dateTime, locationName, locationAddress, neighborhood, budget, groupSizeLimit, tags, privacy } = req.body;

      if (!title || !description || !dateTime || !locationName || !neighborhood) {
        return res.status(400).json({ success: false, error: 'Missing required hangout fields.' });
      }

      const created = dataStore.createHangout({
        title,
        description,
        activityCategory: activityCategory || 'Coffee & Yap',
        activityType: activityType || 'Casual',
        dateTime,
        locationName,
        locationAddress: locationAddress || locationName,
        neighborhood,
        budget: budget || 'Free',
        groupSizeLimit: Number(groupSizeLimit) || 6,
        tags: Array.isArray(tags) ? tags : [],
        privacy: privacy || 'public',
      });

      res.status(201).json({ success: true, data: created });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Join hangout
  app.post('/api/hangouts/:id/join', (req: Request, res: Response) => {
    try {
      const updated = dataStore.joinHangout(req.params.id);
      res.json({ success: true, data: updated, message: 'Successfully joined hangout!' });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Leave hangout
  app.post('/api/hangouts/:id/leave', (req: Request, res: Response) => {
    try {
      const updated = dataStore.leaveHangout(req.params.id);
      res.json({ success: true, data: updated, message: 'You left the hangout.' });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Toggle bookmark / saved
  app.post('/api/hangouts/:id/save', (req: Request, res: Response) => {
    try {
      const updated = dataStore.toggleSaveHangout(req.params.id);
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Report hangout
  app.post('/api/hangouts/:id/report', (req: Request, res: Response) => {
    try {
      const { reason, details, userEmail } = req.body;
      if (!reason || !details) {
        return res.status(400).json({ success: false, error: 'Reason and details are required to submit a report.' });
      }

      const result = dataStore.reportHangout({
        hangoutId: req.params.id,
        reason,
        details,
        userEmail,
      });

      res.json({
        success: true,
        reportId: result.reportId,
        message: 'Thank you for keeping our community safe. Our safety moderation team will review this hangout within 2 hours.',
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // ----------------------------------------------------
  // User Profile & Verification Endpoints
  // ----------------------------------------------------

  app.get('/api/profile', (req: Request, res: Response) => {
    try {
      const profile = dataStore.getCurrentUser();
      res.json({ success: true, data: profile });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/profile', (req: Request, res: Response) => {
    try {
      // Disallow user-editable role or elevation of privileges
      const { role, id, ...safeUpdates } = req.body;
      const updated = dataStore.updateCurrentUser(safeUpdates);
      res.json({ success: true, data: updated, message: 'Profile updated successfully.' });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Get current user's verification status & provider info
  app.get('/api/verification/status', (req: Request, res: Response) => {
    try {
      const user = dataStore.getCurrentUser();
      const providerStatus = verificationAdapter.getProviderStatus();
      res.json({
        success: true,
        data: {
          verification: user.verification,
          providerStatus,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Step 1: Send Phone OTP Code
  app.post('/api/verification/phone/send-otp', async (req: Request, res: Response) => {
    try {
      const { phoneNumber } = req.body;
      const user = dataStore.getCurrentUser();

      const result = await verificationAdapter.sendPhoneOtp(
        user.id,
        phoneNumber,
        user.verification
      );

      res.json(result);
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Step 2: Validate Phone OTP Code
  app.post('/api/verification/phone/verify-otp', (req: Request, res: Response) => {
    try {
      const { sessionId, code } = req.body;
      const user = dataStore.getCurrentUser();

      const result = verificationAdapter.verifyPhoneOtp(
        user.id,
        sessionId,
        code,
        user.verification
      );

      // Persist verified status to dataStore and propagate to hangouts
      const updatedUser = dataStore.updateUserVerification(result.updatedVerification);

      res.json({
        success: true,
        data: updatedUser.verification,
        message: result.message,
      });
    } catch (err: any) {
      // In case of attempt exhaustion, persist failed attempt count to user
      const user = dataStore.getCurrentUser();
      if (user.verification.attemptsCount < 3) {
        dataStore.updateUserVerification({
          ...user.verification,
          attemptsCount: user.verification.attemptsCount + 1,
        });
      }
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Step 3: Initiate Government ID Verification
  app.post('/api/verification/identity/start', (req: Request, res: Response) => {
    try {
      const { documentType, legalFullName } = req.body;
      const user = dataStore.getCurrentUser();

      const result = verificationAdapter.startIdentityVerification(
        user.id,
        documentType,
        legalFullName,
        user.verification
      );

      // Persist pending identity review state
      const updatedUser = dataStore.updateUserVerification(result.updatedVerification);

      res.json({
        success: true,
        sessionId: result.sessionId,
        data: updatedUser.verification,
        providerStatus: result.providerStatus,
        message: result.message,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // ----------------------------------------------------
  // Gemma 4 AI Hangout Planner Endpoints
  // ----------------------------------------------------

  // Status check for Gemma 4 runtime configuration
  app.get('/api/gemma/status', (req: Request, res: Response) => {
    try {
      const status = gemmaAdapter.getRuntimeStatus();
      res.json({ success: true, data: status });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Generate Hangout Plan via Gemma 4 adapter
  app.post('/api/gemma/plan', async (req: Request, res: Response) => {
    try {
      const { groupSize, vibes, budget, timeOfDay, durationHours, environment, location, notes } = req.body;

      const plan = await gemmaAdapter.planHangout({
        groupSize: Number(groupSize) || 4,
        vibes: Array.isArray(vibes) ? vibes : ['Coffee & Yap'],
        budget: budget || 'Free',
        timeOfDay: timeOfDay || 'Afternoon',
        durationHours: Number(durationHours) || 2.5,
        environment: environment || 'Indoor',
        location: location || 'Lower East Side',
        notes: notes || '',
      });

      res.json({ success: true, data: plan });
    } catch (err: any) {
      console.error('[API /api/gemma/plan] Error:', err);
      res.status(400).json({
        success: false,
        error: err.message || 'Failed to generate hangout plan with Gemma 4.',
      });
    }
  });

  // ----------------------------------------------------
  // Admin Portal & Backend Control Endpoints (Protected by requireAdmin)
  // ----------------------------------------------------

  // Get administrative metrics
  app.get('/api/admin/metrics', requireAdmin, (req: Request, res: Response) => {
    try {
      const metrics = dataStore.getAdminMetrics();
      const gemmaStatus = gemmaAdapter.getRuntimeStatus();
      res.json({
        success: true,
        data: {
          ...metrics,
          gemmaStatus,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get all safety reports
  app.get('/api/admin/reports', requireAdmin, (req: Request, res: Response) => {
    try {
      const reports = dataStore.getAllReports();
      res.json({ success: true, data: reports });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Resolve safety report
  app.post('/api/admin/reports/:id/resolve', requireAdmin, (req: Request, res: Response) => {
    try {
      const { action } = req.body;
      const result = dataStore.resolveReport(req.params.id, action || 'dismissed');
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Delete hangout as moderator/admin
  app.delete('/api/admin/hangouts/:id', requireAdmin, (req: Request, res: Response) => {
    try {
      const deleted = dataStore.deleteHangout(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Hangout not found or already deleted.' });
      }
      res.json({ success: true, message: 'Hangout successfully deleted by administrator.' });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Update hangout as admin
  app.patch('/api/admin/hangouts/:id', requireAdmin, (req: Request, res: Response) => {
    try {
      const updated = dataStore.updateHangout(req.params.id, req.body);
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Get raw database dump
  app.get('/api/admin/database', requireAdmin, (req: Request, res: Response) => {
    try {
      const dump = dataStore.getRawDatabase();
      res.json({ success: true, data: dump });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Reset database to initial sample seed
  app.post('/api/admin/database/reset', requireAdmin, (req: Request, res: Response) => {
    try {
      const result = dataStore.resetToInitialData();
      res.json({ success: true, message: result.message });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Update Gemma 4 runtime configuration dynamically
  app.post('/api/admin/gemma/config', requireAdmin, (req: Request, res: Response) => {
    try {
      const { endpointUrl, apiKey, modelName, timeoutMs } = req.body;
      const status = gemmaAdapter.updateRuntimeConfig({
        endpointUrl,
        apiKey,
        modelName,
        timeoutMs,
      });
      res.json({ success: true, data: status, message: 'Gemma 4 runtime configuration updated.' });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Get raw Gemma 4 runtime configuration
  app.get('/api/admin/gemma/raw-config', requireAdmin, (req: Request, res: Response) => {
    try {
      const config = gemmaAdapter.getRawConfig();
      res.json({ success: true, data: config });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Run direct diagnostic prompt test
  app.post('/api/admin/gemma/test', requireAdmin, async (req: Request, res: Response) => {
    const startTime = Date.now();
    try {
      const testReq = req.body || {
        groupSize: 4,
        vibes: ['Diagnostic Test', 'Indie Coffee & Yap'],
        budget: '$',
        timeOfDay: 'Afternoon',
        durationHours: 2,
        environment: 'Indoor',
        location: 'Admin Diagnostic Sandbox',
      };
      const result = await gemmaAdapter.planHangout(testReq);
      const latencyMs = Date.now() - startTime;
      res.json({
        success: true,
        latencyMs,
        data: result,
      });
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      res.status(400).json({
        success: false,
        latencyMs,
        error: err.message || 'Diagnostic inference failed.',
      });
    }
  });

  // ----------------------------------------------------
  // Admin Verification Review Endpoints
  // ----------------------------------------------------

  // Get all verification requests and verified users
  app.get('/api/admin/verifications', requireAdmin, (req: Request, res: Response) => {
    try {
      const verifications = dataStore.getAllVerifications();
      res.json({ success: true, data: verifications });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Review (approve or reject) a user's identity verification
  app.post('/api/admin/verifications/:userId/review', requireAdmin, (req: Request, res: Response) => {
    try {
      const { action, reason } = req.body;
      const user = dataStore.getCurrentUser();

      let updatedVerification = { ...user.verification };
      if (action === 'approve') {
        updatedVerification = verificationAdapter.adminApproveIdentityVerification(
          req.params.userId,
          updatedVerification
        );
      } else {
        updatedVerification = verificationAdapter.adminRejectIdentityVerification(
          req.params.userId,
          updatedVerification,
          reason || 'Document verification criteria failed.'
        );
      }

      const updatedUser = dataStore.updateUserVerification(updatedVerification);
      res.json({
        success: true,
        data: updatedUser.verification,
        message: action === 'approve' ? 'User Identity successfully approved and verified!' : 'Identity verification rejected.',
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Revoke or reset verification status (e.g. for testing or enforcement)
  app.post('/api/admin/verifications/:userId/reset', requireAdmin, (req: Request, res: Response) => {
    try {
      const user = dataStore.getCurrentUser();
      const resetVerification = {
        status: 'unverified' as const,
        tier: 'none' as const,
        phoneVerified: false,
        phoneNumberMasked: undefined,
        identityVerified: false,
        identityStatus: 'not_started' as const,
        provider: 'YapOut Secure Verification Gateway',
        attemptsCount: 0,
        maxAttempts: 3,
        rejectionReason: undefined,
        cooldownUntil: undefined,
        verifiedAt: undefined,
      };

      const updatedUser = dataStore.updateUserVerification(resetVerification);
      res.json({
        success: true,
        data: updatedUser.verification,
        message: 'User verification status has been reset.',
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // ----------------------------------------------------
  // Static / Vite Dev Middleware Integration
  // ----------------------------------------------------

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[YapOut Server] Running on http://localhost:${PORT}`);
    const gemmaStatus = gemmaAdapter.getRuntimeStatus();
    console.log(`[YapOut Server] Gemma 4 Runtime: ${gemmaStatus.configured ? 'LIVE (Gemini API: ' + gemmaStatus.modelName + ')' : 'SIMULATED (GEMINI_API_KEY unset or call failed)'}`);
  });
}

startServer().catch((err) => {
  console.error('[YapOut Server] Failed to start:', err);
  process.exit(1);
});

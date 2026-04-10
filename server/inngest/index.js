import { Inngest } from "inngest";
import { Op } from "sequelize";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import Movie from "../models/Movie.js";
import { sendEmail } from "../config/nodeMailer.js";

export const inngest = new Inngest({ 
  id: "movie-ticket-booking",
  logLevel: "debug"  // Enable debug logging
});

// Log Inngest initialization
console.log("\n✅ [Inngest] Initialized correctly");
console.log("   ID: movie-ticket-booking");
console.log("   Version:", inngest.version || "latest");
console.log("   Ready to process Clerk webhooks\n");

const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    console.log("\n🎯 [FUNCTION CALLED] syncUserCreation has been invoked!");
    console.log("   This means Inngest received the clerk/user.created event!");
    
    const timestamp = new Date().toISOString();
    console.log("\n" + "█".repeat(80));
    console.log(`⏰ [${timestamp}] 🔔 INNGEST EVENT RECEIVED: clerk/user.created`);
    console.log("█".repeat(80));
    
    try {
      console.log("\n📋 [Step 1] Extracting event data from Clerk webhook...");
      const { id, first_name, last_name, email_addresses, image_url } = event.data;
      
      console.log(`   ✓ Clerk User ID: ${id}`);
      console.log(`   ✓ First Name: ${first_name}`);
      console.log(`   ✓ Last Name: ${last_name}`);
      console.log(`   ✓ Email: ${email_addresses?.[0]?.email_address || 'NOT PROVIDED'}`);
      console.log(`   ✓ Image URL: ${image_url ? 'yes' : 'not provided'}`);
      
      if (!id || !email_addresses || email_addresses.length === 0) {
        throw new Error(`Invalid user data - missing ID or email`);
      }

      const userData = {
        id,
        email: email_addresses[0].email_address,
        name: `${first_name} ${last_name}`,
        image: image_url || null,
      };
      
      console.log("\n📋 [Step 2] Prepared user data object:");
      console.log(`   ✓ ID: ${userData.id}`);
      console.log(`   ✓ Email: ${userData.email}`);
      console.log(`   ✓ Name: ${userData.name}`);
      console.log(`   ✓ Image: ${userData.image ? 'yes' : 'null'}`);
      
      console.log("\n💾 [Step 3] Executing User.create() on Aiven MySQL...");
      console.log(`   📍 Table: Users`);
      console.log(`   📍 Database: quickshow_db`);
      
      const createdUser = await User.create(userData);
      
      console.log("\n✅ [Step 4] SUCCESS! User inserted into database!");
      console.log(`   ✓ Record ID: ${createdUser.id}`);
      console.log(`   ✓ Email: ${createdUser.email}`);
      console.log(`   ✓ Name: ${createdUser.name}`);
      console.log(`   ✓ Admin: ${createdUser.isAdmin}`);
      console.log(`   ✓ Created: ${createdUser.createdAt}`);
      console.log("█".repeat(80) + "\n");
      
      return { success: true, userId: createdUser.id };
    } catch (error) {
      console.log("\n" + "▓".repeat(80));
      console.log(`❌ [ERROR] User creation FAILED`);
      console.log(`⏰ Time: ${timestamp}`);
      console.log("▓".repeat(80));
      console.error(`Error Message: ${error.message}`);
      console.error(`Error Code: ${error.code || 'N/A'}`);
      console.error(`DB Connection: ${error.connection ? 'yes' : 'not available'}`);
      if (error.parent) {
        console.error(`Database Error: ${error.parent.message}`);
      }
      console.error(`Stack:`, error.stack);
      console.log("▓".repeat(80) + "\n");
      throw error;
    }
  }
);

const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const timestamp = new Date().toISOString();
    try {
      console.log("\n" + "=".repeat(80));
      console.log(`⏰ [${timestamp}] 🔔 [Inngest] RECEIVED: clerk/user.deleted event`);
      console.log("=".repeat(80));
      
      const { id } = event.data;
      console.log(`🗑️  [Database] Preparing to DELETE user from Aiven MySQL...`);
      console.log(`   • User ID: ${id}`);
      
      const result = await User.destroy({ where: { id } });
      
      console.log(`✅ [Database] User DELETED successfully!`);
      console.log(`   • Rows Deleted: ${result}`);
      console.log("=".repeat(80) + "\n");
      
      return { success: true, deletedCount: result };
    } catch (error) {
      console.error("\n" + "❌".repeat(40));
      console.error(`⏰ [${timestamp}] 🔴 [Inngest] ERROR deleting user`);
      console.error("❌".repeat(40));
      console.error("Error Message:", error.message);
      console.error("Error Code:", error.code);
      console.error("Stack Trace:", error.stack);
      console.error("❌".repeat(40) + "\n");
      throw error;
    }
  }
);

const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const timestamp = new Date().toISOString();
    try {
      console.log("\n" + "=".repeat(80));
      console.log(`⏰ [${timestamp}] 🔔 [Inngest] RECEIVED: clerk/user.updated event`);
      console.log("=".repeat(80));
      
      const { id, first_name, last_name, email_addresses, image_url } =
        event.data;
      
      console.log("📋 Event Details:");
      console.log(`   • Clerk User ID: ${id}`);
      console.log(`   • Updated Name: ${first_name} ${last_name}`);
      console.log(`   • Updated Email: ${email_addresses?.[0]?.email_address || 'N/A'}`);
      
      const userData = {
        email: email_addresses[0].email_address,
        name: `${first_name} ${last_name}`,
        image: image_url || null,
      };
      
      console.log(`\n✏️  [Database] Preparing to UPDATE user in Aiven MySQL...`);
      console.log(`   • Table: Users`);
      console.log(`   • User ID: ${id}`);
      console.log(`   • New Name: ${userData.name}`);
      console.log(`   • New Email: ${userData.email}`);
      
      const [updatedCount] = await User.update(userData, { where: { id } });
      
      console.log(`\n✅ [Database] User UPDATED successfully!`);
      console.log(`   • Rows Updated: ${updatedCount}`);
      console.log("=".repeat(80) + "\n");
      
      return { success: true, updatedCount };
    } catch (error) {
      console.error("\n" + "❌".repeat(40));
      console.error(`⏰ [${timestamp}] 🔴 [Inngest] ERROR updating user`);
      console.error("❌".repeat(40));
      console.error("Error Message:", error.message);
      console.error("Error Code:", error.code);
      console.error("Stack Trace:", error.stack);
      console.error("❌".repeat(40) + "\n");
      throw error;
    }
  }
);

const releaseSeatsAndDeleteBooking = inngest.createFunction(
  { id: "release-seats-delete-booking" },
  { event: "app/checkpayment" },
  async ({ event, step }) => {
    const tenMinutesLater = new Date(Date.now() + 10 * 60 * 1000);
    await step.sleepUntil("wait-for-10-minutes", tenMinutesLater);

    await step.run("check-payment-status", async () => {
      const bookingId = event.data.bookingId;
      const booking = await Booking.findByPk(bookingId);

      if (!booking || booking.isPaid) {
        return;
      }

      const show = await Show.findByPk(booking.showId);
      if (show) {
        booking.bookedSeats.forEach((seat) => {
          delete show.occupiedSeats[seat];
        });
        await show.save();
      }

      await Booking.destroy({ where: { id: booking.id } });
    });
  }
);

const sendBookingConfirmationEmail = inngest.createFunction(
  { id: "send-booking-confirmation-email" },
  { event: "app/show.booked" },
  async ({ event }) => {
    const { bookingId } = event.data;
    const booking = await Booking.findByPk(bookingId, {
      include: [
        {
          model: Show,
          as: "show",
          include: [{ model: Movie, as: "movie" }],
        },
        { model: User, as: "user" },
      ],
    });

    if (!booking || !booking.user || !booking.show || !booking.show.movie) {
      return;
    }

    await sendEmail({
      to: booking.user.email,
      subject: `Payment Confirmation: "${booking.show.movie.title}" booked!`,
      body: `<div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Hi ${booking.user.name},</h2>
        <p>Your booking for <strong style="color: #F84565;">"${
          booking.show.movie.title
        }"</strong> is confirmed.</p>
        <p>
          <strong>Date:</strong> ${new Date(
            booking.show.showDateTime
          ).toLocaleDateString("en-US", { timeZone: "Africa/Kigali" })}<br />
          <strong>Time:</strong> ${new Date(
            booking.show.showDateTime
          ).toLocaleTimeString("en-US", { timeZone: "Africa/Kigali" })}
        </p>
        <p>Enjoy the show! 🍿</p>
        <p>Thanks for booking with us!<br />- QuickShow Team</P>
      </div>`,
    });
  }
);

const sendShowReminders = inngest.createFunction(
  { id: "send-show-reminders" },
  { cron: "0 */8 * * *" },
  async ({ step }) => {
    const now = new Date();
    const in8Hours = new Date(now.getTime() + 8 * 60 * 60 * 1000);
    const windowStart = new Date(in8Hours.getTime() - 10 * 60 * 1000);

    const reminderTasks = await step.run("prepare-reminder-tasks", async () => {
      const shows = await Show.findAll({
        where: {
          showDateTime: { [Op.gte]: windowStart, [Op.lte]: in8Hours },
        },
        include: [{ model: Movie, as: "movie" }],
      });

      const tasks = [];

      for (const show of shows) {
        if (!show.movie || !show.occupiedSeats) continue;

        const userIds = [...new Set(Object.values(show.occupiedSeats || {}))];
        if (userIds.length === 0) continue;

        const users = await User.findAll({
          where: { id: userIds },
          attributes: ["name", "email"],
        });

        for (const user of users) {
          tasks.push({
            userEmail: user.email,
            userName: user.name,
            movieTitle: show.movie.title,
            showTime: show.showDateTime,
          });
        }
      }

      return tasks;
    });

    if (reminderTasks.length === 0) {
      return { sent: 0, message: "No reminders to send." };
    }

    const results = await step.run("send-all-reminders", async () => {
      return await Promise.allSettled(
        reminderTasks.map((task) =>
          sendEmail({
            to: task.userEmail,
            subject: `Reminder: Your movie "${task.movieTitle}" starts soon!`,
            body: `<div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Hello ${task.userName},</h2>
        <p>This is a quick reminder that your movie:</p>
        <h3 style="color: #F84565;">"${task.movieTitle}"</h3>
        <p>
          is scheduled for <strong>${new Date(task.showTime).toLocaleDateString(
            "en-US",
            { timeZone: "Africa/Kigali" }
          )}</strong> at
          <strong>${new Date(task.showTime).toLocaleTimeString("en-US", {
            timeZone: "Africa/Kigali",
          })}</strong>.
        </p>
        <p>It starts in approximately <strong>8 hours</strong> - make sure you're ready!</p>
        <br />
        <p>Enjoy the show! 🍿 - QuickShow Team</p>
      </div>`,
          })
        )
      );
    });

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.length - sent;

    return {
      sent,
      failed,
      message: `Sent ${sent} reminder(s), ${failed} failed.`,
    };
  }
);

const sendNewShowNotifications = inngest.createFunction(
  { id: "send-new-show-notifications" },
  { event: "app/show.added" },
  async ({ event }) => {
    const { movieTitle } = event.data;

    const users = await User.findAll();

    for (const user of users) {
      const userEmail = user.email;
      const userName = user.name;

      const subject = `🎬 New Show Added: ${movieTitle}`;
      const body = `<div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Hi ${userName},</h2>
        <p>We've just added a new show to our library:</p>
        <h3 style="color: #F84565;">"${movieTitle}"</h3>
        <p>Visit our website - <a href="https://quickshow-sigma-roan.vercel.app/">QuickShow</a> 🔗</p>
        <br />
        <p>Thanks, <br />QuickShow Team</p>
      </div>`;

      await sendEmail({
        to: userEmail,
        subject,
        body,
      });
    }

    return { message: "Notifications sent." };
  }
);

export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
  releaseSeatsAndDeleteBooking,
  sendBookingConfirmationEmail,
  sendShowReminders,
  sendNewShowNotifications,
];

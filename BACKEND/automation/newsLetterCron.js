import cron from "node-cron";
import { Job } from "../models/jobsSchema.js";
import { User } from "../models/userSchema.js";
import { sendEmail } from "../utils/sendEmail.js";

export const newsLetterCron = () => {
  cron.schedule("*/1 * * * *", async () => {
    // console.log("Running Cron Automation");
    const jobs = await Job.find({ newsLettersSent: false });
    for (const job of jobs) {
      try {
        const filteredUsers = await User.find({
          $or: [
            { "niches.firstNiche": job.jobNiche },
            { "niches.secondNiche": job.jobNiche },
            { "niches.thirdNiche": job.jobNiche },
          ],
        });
        for (const user of filteredUsers) {
          const subject = `Hot Job Alert: ${job.title} in ${job.jobNiche} Available Now`;
          const message = `
🚀 **New Job Opportunity!**

Hi **${user.name}**,

We are excited to share a new job opportunity that aligns perfectly with your niche!

✨ **Job Details:**
- **Position:** ${job.title}
- **Company:** ${job.companyName}
- **Location:** ${job.location}
- **Salary:** ${job.salary}

Don't miss out on this amazing opportunity! 


Best of luck in your job search!

Best regards,  
The NicheNest Team

---

You received this email because you signed up for job alerts at NicheNest.  
NicheNest, 123 Startup St, Silicon Valley, CA  
To unsubscribe from these emails, Contact Us.
`;


          sendEmail({
            email: user.email,
            subject,
            message,
          });
        }
        job.newsLettersSent = true;
        await job.save();
      } catch (error) {
        console.log("ERROR IN NODE CRON CATCH BLOCK");
        return next(console.error(error || "Some error in Cron."));
      }
    }
  });
};
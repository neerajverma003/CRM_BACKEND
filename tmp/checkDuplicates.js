const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

const employeeAttendanceSchema = new mongoose.Schema({
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    date: { type: Date, required: true },
    clockIn: { type: Date },
    clockOut: { type: Date },
    status: { type: String }
});

const adminAttendanceSchema = new mongoose.Schema({
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    date: { type: Date, required: true },
    clockIn: { type: Date },
    clockOut: { type: Date },
    status: { type: String }
});

const EmployeeAttendance = mongoose.models.Attendance || mongoose.model('Attendance', employeeAttendanceSchema);
const AdminAttendance = mongoose.models.AdminAttendance || mongoose.model('AdminAttendance', adminAttendanceSchema);

async function findDuplicates() {
    try {
        const empAgg = await EmployeeAttendance.aggregate([
            {
                $group: {
                    _id: {
                        employee: "$employee",
                        year: { $year: "$date" },
                        month: { $month: "$date" },
                        day: { $dayOfMonth: "$date" }
                    },
                    count: { $sum: 1 },
                    records: { $push: "$_id" }
                }
            },
            {
                $match: { count: { $gt: 1 } }
            }
        ]);

        const adminAgg = await AdminAttendance.aggregate([
            {
                $group: {
                    _id: {
                        admin: "$admin",
                        year: { $year: "$date" },
                        month: { $month: "$date" },
                        day: { $dayOfMonth: "$date" }
                    },
                    count: { $sum: 1 },
                    records: { $push: "$_id" }
                }
            },
            {
                $match: { count: { $gt: 1 } }
            }
        ]);

        console.log("=== Duplicate Employee Attendance Records ===");
        if (empAgg.length === 0) console.log("No duplicates found.");
        empAgg.forEach(doc => {
            console.log(`Employee ID: ${doc._id.employee}, Date: ${doc._id.year}-${doc._id.month}-${doc._id.day}, Count: ${doc.count}`);
            console.log(`Record IDs: ${doc.records.join(', ')}`);
        });

        console.log("\n=== Duplicate Admin Attendance Records ===");
        if (adminAgg.length === 0) console.log("No duplicates found.");
        adminAgg.forEach(doc => {
            console.log(`Admin ID: ${doc._id.admin}, Date: ${doc._id.year}-${doc._id.month}-${doc._id.day}, Count: ${doc.count}`);
            console.log(`Record IDs: ${doc.records.join(', ')}`);
        });

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

findDuplicates();

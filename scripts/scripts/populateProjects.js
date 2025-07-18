"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
// scripts/populateProjects.ts
var database_1 = require("../src/utils/firebase/database"); // Adjust path if database file has .js extension
var uuid_1 = require("uuid");
var placeholderImageUrl = function (width, height) {
    if (width === void 0) { width = 300; }
    if (height === void 0) { height = 200; }
    return "https://via.placeholder.com/".concat(width, "x").concat(height, ".png?text=Sample+Image");
};
var createSampleProject = function (category, titleSuffix) {
    var id = (0, uuid_1.v4)();
    var baseTitle = "".concat(category, " Project ").concat(titleSuffix);
    var specifications = {
        duration: "".concat(Math.floor(Math.random() * 4) + 1, " Weeks"),
        location: "Sample Location, ".concat(category, " Area"),
        services: ['Service A', 'Service B', 'Service C'].slice(0, Math.floor(Math.random() * 3) + 1),
        materials: ['Material X', 'Material Y', 'Material Z'].slice(0, Math.floor(Math.random() * 3) + 1),
    };
    var projectDetails = {
        challenge: "The main challenge for the ".concat(baseTitle, " was integrating modern features while preserving the original character."),
        solution: "Our team implemented a phased approach, starting with structural reinforcements followed by careful installation of new systems for the ".concat(baseTitle, "."),
        outcome: "The ".concat(baseTitle, " resulted in a fully functional and aesthetically pleasing space, exceeding client expectations."),
    };
    var gallery = [
        { url: placeholderImageUrl(800, 600), caption: "".concat(baseTitle, " - View 1") },
        { url: placeholderImageUrl(800, 600), caption: "".concat(baseTitle, " - Detail A") },
        { url: placeholderImageUrl(800, 600), caption: "".concat(baseTitle, " - Detail B") },
    ];
    return {
        id: id,
        title: baseTitle,
        description: "This is a sample description for the ".concat(baseTitle, ". It involved extensive work and coordination."),
        category: category,
        image: placeholderImageUrl(400, 300),
        imageUrl: placeholderImageUrl(400, 300),
        completionDate: "".concat(['January', 'February', 'March', 'April', 'May', 'June'][Math.floor(Math.random() * 6)], " 202").concat(Math.floor(Math.random() * 3) + 2), // e.g., March 2024
        highlights: [
            "Highlight 1 for ".concat(baseTitle),
            "Highlight 2 for ".concat(baseTitle),
            "Highlight 3 for ".concat(baseTitle),
        ],
        type: "".concat(category, " Renovation"), // Example type
        details: "More detailed information about the ".concat(baseTitle, ". Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."),
        tableOnly: false,
        specifications: specifications,
        projectDetails: projectDetails,
        gallery: gallery,
    };
};
var sampleProjects = [
    createSampleProject('Commercial', 'Alpha'),
    createSampleProject('Residential', 'Beta'),
    createSampleProject('Emergency', 'Gamma'), // Using 'Emergency' as per type definition
];
function populateFirestore() {
    return __awaiter(this, void 0, void 0, function () {
        var _i, sampleProjects_1, project, result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Starting Firestore population...');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    _i = 0, sampleProjects_1 = sampleProjects;
                    _a.label = 2;
                case 2:
                    if (!(_i < sampleProjects_1.length)) return [3 /*break*/, 5];
                    project = sampleProjects_1[_i];
                    console.log("Adding project: ".concat(project.title, " (ID: ").concat(project.id, ")"));
                    return [4 /*yield*/, (0, database_1.setDocument)('projects', project.id, project)];
                case 3:
                    result = _a.sent();
                    if (!result.success) {
                        console.error("Failed to add project ".concat(project.id, ":"), result.error);
                    }
                    else {
                        console.log("Successfully added project ".concat(project.id));
                    }
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    console.log('Firestore population completed.');
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    console.error('Error populating Firestore:', error_1);
                    process.exit(1); // Exit with error code
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
// Execute the function
populateFirestore();

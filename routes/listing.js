const express = require("express");
const router = express.Router();
const { isLoggedIn ,isOwner} = require("../middleware.js");
const wrapAsync = require("../utils/wrapAsync.js");
const multer = require('multer');
const { storage } = require("../cloudeconfig.js"); 
const { listingSchema } = require("../schema.js");
const upload = multer({ storage });



const Listing = require("../models/listing.js");



const listingController = require("../controllers/listing.js");



// Middleware to validate listing schema
const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map(el => el.message).join(", ");
    throw new ExpressError(400, errMsg);
  }
  next();
};

// INDEX - Show all listings (or filter by category)
router.get("/", wrapAsync(listingController.index));

// NEW - Render form
router.get("/new", isLoggedIn, listingController.renderNewForm);

// CREATE - Create a new listing
router.post("/", isLoggedIn, upload.single("listing[image]"), validateListing, wrapAsync(listingController.createListing));

//SEARCH - search for title or location
router.get("/search", wrapAsync(listingController.searchListings));


// SHOW - Show single listing details
router.get("/:id", wrapAsync(listingController.showListing));

// EDIT - Show edit form
router.get("/:id/edit", isLoggedIn,isOwner, wrapAsync(listingController.renderEditForm));

// UPDATE - Update listing
router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  upload.single("listing[image]"),
  validateListing,
  wrapAsync(listingController.updateListing)
);

// DELETE - Delete listing
router.delete("/:id", isLoggedIn, isOwner,wrapAsync(listingController.destroyListing));

module.exports = router;
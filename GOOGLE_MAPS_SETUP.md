# Google Maps API Setup Guide

This guide will help you set up Google Places Autocomplete for the address field.

## Step 1: Get a Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Maps JavaScript API**
   - **Places API**
4. Go to **Credentials** section
5. Click **Create Credentials** → **API Key**
6. Copy your API key

## Step 2: Configure API Key Restrictions (Recommended)

### Application Restrictions:
- Select **HTTP referrers (web sites)**
- Add your domains:
  - `http://localhost:3000/*` (for development)
  - `https://yourdomain.com/*` (for production)

### API Restrictions:
- Select **Restrict key**
- Choose only these APIs:
  - Maps JavaScript API
  - Places API

## Step 3: Add API Key to Your Project

Add the following line to your `.env.local` file:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

**Important:** Replace `your_actual_api_key_here` with your actual API key from Step 1.

## Step 4: Restart Development Server

After adding the API key, restart your development server:

```bash
npm run dev
```

## Features Implemented

### ✅ Address Autocomplete (Like ISC)
- **Real-time suggestions** as user types
- **USA addresses only** (configurable)
- **Auto-fills multiple fields:**
  - Street Address
  - City
  - State
  - ZIP Code

### ✅ ISC-Style UI
- Clean dropdown with suggestions
- "powered by Google" branding
- Professional appearance matching ISC

## Pricing Information

Google Maps Platform offers:
- **$200 free credit per month**
- **Pay-as-you-go** after free credit
- Places API: ~$0.017 per autocomplete request
- Most small to medium applications stay within free tier

## Testing

1. Open the quote form: `/agency/quote/[programId]`
2. Navigate to "Applicant Physical Location" section
3. Start typing an address (e.g., "123 Main")
4. You should see autocomplete suggestions
5. Select an address from the dropdown
6. All fields (street, city, state, zip) should auto-populate

## Troubleshooting

### No suggestions appearing?
- Check your API key is correct in `.env.local`
- Verify Places API is enabled in Google Cloud Console
- Check browser console for errors
- Ensure you've restarted the dev server after adding the key

### "This API key is invalid" error?
- Double-check the key is copied correctly
- Verify the key restrictions allow your domain
- Make sure both Maps JavaScript API and Places API are enabled

### Suggestions but fields not auto-filling?
- Check browser console for JavaScript errors
- Verify the field names in `formData` match (`streetAddress`, `city`, `state`, `zip`)

## File Structure

```
src/
├── hooks/
│   └── useGooglePlacesAutocomplete.ts    # Custom hook for autocomplete
├── app/
│   └── agency/
│       └── quote/
│           └── [programId]/
│               └── page.tsx               # Quote form with autocomplete
```

## API Key Security

⚠️ **Important Security Notes:**
- Never commit `.env.local` to version control
- Always add `.env.local` to `.gitignore`
- Use API key restrictions (HTTP referrers)
- Limit API access to only Maps JavaScript API and Places API
- Monitor usage in Google Cloud Console

## Need Help?

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [Places Autocomplete Guide](https://developers.google.com/maps/documentation/javascript/place-autocomplete)
- [API Key Best Practices](https://developers.google.com/maps/api-security-best-practices)












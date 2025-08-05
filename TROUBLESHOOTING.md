# Speech Recognition Troubleshooting Guide

If you're experiencing issues with voice recording in the Voice Notes app, here are some solutions to try:

## 🔧 **Quick Fixes**

### 1. **Browser Requirements**
- ✅ **Use Chrome, Safari, or Edge** (latest versions)
- ❌ Firefox has limited speech recognition support
- ❌ Mobile browsers may not work consistently

### 2. **Microphone Permissions**
- **Allow microphone access** when prompted
- **Check browser settings** if permission was denied
- **Refresh the page** after granting permissions

### 3. **Network Requirements**
- **HTTPS connection required** (Vercel provides this automatically)
- **Internet connection needed** for Google's speech recognition servers
- **Check firewall settings** - some networks block speech recognition

## 🚨 **Common Error Messages & Solutions**

### "Speech recognition service unavailable"
**Causes:**
- Network connectivity issues
- Firewall blocking Google's servers
- Browser restrictions
- Corporate network policies

**Solutions:**
- Try a different network (mobile hotspot, home WiFi)
- Use a different browser
- Check if your network allows speech recognition services

### "Microphone access denied"
**Causes:**
- Browser permission denied
- System microphone access blocked
- Multiple apps using microphone

**Solutions:**
- Click the microphone icon in browser address bar
- Check system microphone permissions
- Close other apps using microphone

### "No speech detected"
**Causes:**
- Microphone too far away
- Background noise
- Microphone not working

**Solutions:**
- Speak closer to microphone
- Reduce background noise
- Test microphone in other apps

## 🛠️ **Advanced Troubleshooting**

### Debug Information
Click "Show Debug Info" in the app to see:
- Browser information
- Network status
- Speech recognition support
- Protocol and hostname

### Manual Testing
1. **Test microphone** in other apps (Zoom, Teams, etc.)
2. **Check browser console** for error messages
3. **Try incognito/private mode** to rule out extensions
4. **Test on different device** to isolate the issue

## 📱 **Mobile Devices**

### iOS (Safari)
- Speech recognition works but may be limited
- Requires iOS 14.5+
- May need to enable Siri for better results

### Android (Chrome)
- Generally works well
- May need to enable "Google" app permissions
- Check if "Ok Google" is enabled

## 🌐 **Network-Specific Issues**

### Corporate Networks
- Many corporate firewalls block speech recognition
- Try using mobile hotspot
- Contact IT department if needed

### School/University Networks
- Often have strict content filtering
- May block Google's speech services
- Try from home or mobile network

### Public WiFi
- Some public networks block certain services
- Try mobile data instead

## 🔄 **Alternative Solutions**

If speech recognition continues to fail:

1. **Type manually** - The text area works perfectly for manual input
2. **Use voice-to-text on your device** - Many phones have built-in speech recognition
3. **Copy from other apps** - Use your device's native speech recognition and paste

## 📞 **Getting Help**

If none of these solutions work:

1. **Copy the debug information** from the app
2. **Note your browser and operating system**
3. **Describe the exact error message**
4. **Try the app on a different device/network**

## 🎯 **Best Practices**

- **Use Chrome** for the best experience
- **Allow all permissions** when prompted
- **Test on a stable network** (home WiFi, mobile data)
- **Keep browser updated** to latest version
- **Close unnecessary tabs/apps** to free up resources 
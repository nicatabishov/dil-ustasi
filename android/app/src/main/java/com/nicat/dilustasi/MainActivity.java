package com.nicat.dilustasi;

import android.Manifest;
import android.app.Activity;
import android.content.ContentValues;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.MediaStore;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.view.ViewGroup;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import org.json.JSONArray;

import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;

/** Dil Ustası: canlı web uygulamasını gösterir; konuşma tanıma ve yedekleme için yerel köprü sağlar. */
public class MainActivity extends Activity {
    private static final String HOST = "nicatabishov.github.io";
    private static final String START = "https://" + HOST + "/dil-ustasi/";
    private static final int REQ_MIC = 1, REQ_FILE = 2;

    private WebView web;
    private SpeechRecognizer recognizer;
    private String pendingLang;
    private ValueCallback<Uri[]> fileCallback;

    private static final String OFFLINE = "<!doctype html><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'>"
            + "<body style='font-family:sans-serif;text-align:center;padding:60px 24px;background:#f4f5f9;color:#171923'>"
            + "<div style='font-size:64px'>📡</div><h2>İnternet bağlantısı gerekli</h2>"
            + "<p style='color:#687085'>Uygulamanın ilk açılışı için internet gerekir. Bağlantını kontrol edip tekrar dene.</p>"
            + "<a href='" + START + "' style='display:inline-block;margin-top:16px;background:#2563eb;color:#fff;font-weight:700;"
            + "padding:14px 26px;border-radius:12px;text-decoration:none'>Tekrar dene</a></body>";

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        web = new WebView(this);
        setContentView(web, new ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        web.addJavascriptInterface(new Bridge(), "AndroidSR");
        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
                Uri u = r.getUrl();
                if (HOST.equals(u.getHost()) && u.getPath() != null && u.getPath().startsWith("/dil-ustasi")) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception ignored) { }
                return true;
            }

            @Override
            public void onReceivedError(WebView v, WebResourceRequest r, WebResourceError e) {
                if (r.isForMainFrame()) v.loadDataWithBaseURL(null, OFFLINE, "text/html", "utf-8", null);
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams p) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = cb;
                Intent i = new Intent(Intent.ACTION_GET_CONTENT);
                i.addCategory(Intent.CATEGORY_OPENABLE);
                i.setType("*/*");
                try { startActivityForResult(i, REQ_FILE); } catch (Exception e) { fileCallback = null; return false; }
                return true;
            }
        });
        if (state != null) web.restoreState(state); else web.loadUrl(START);
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @Override
    public void onBackPressed() {
        if (web.canGoBack()) web.goBack(); else super.onBackPressed();
    }

    @Override
    protected void onPause() {
        super.onPause();
        web.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        web.onResume();
    }

    @Override
    protected void onDestroy() {
        if (recognizer != null) recognizer.destroy();
        web.destroy();
        super.onDestroy();
    }

    @Override
    protected void onActivityResult(int req, int res, Intent data) {
        super.onActivityResult(req, res, data);
        if (req == REQ_FILE && fileCallback != null) {
            fileCallback.onReceiveValue(res == RESULT_OK && data != null && data.getData() != null ? new Uri[]{data.getData()} : null);
            fileCallback = null;
        }
    }

    @Override
    public void onRequestPermissionsResult(int req, String[] perms, int[] results) {
        if (req != REQ_MIC) return;
        if (results.length > 0 && results[0] == PackageManager.PERMISSION_GRANTED && pendingLang != null) listen(pendingLang);
        else { js("error", "'not-allowed'"); js("end", "null"); }
        pendingLang = null;
    }

    private void js(String type, String jsonData) {
        web.evaluateJavascript("window.__sr&&window.__sr('" + type + "'," + jsonData + ")", null);
    }

    private void listen(String lang) {
        if (!SpeechRecognizer.isRecognitionAvailable(this)) {
            js("error", "'service-not-allowed'"); js("end", "null");
            return;
        }
        if (recognizer == null) {
            recognizer = SpeechRecognizer.createSpeechRecognizer(this);
            recognizer.setRecognitionListener(new RecognitionListener() {
                @Override public void onResults(Bundle b) {
                    ArrayList<String> list = b.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                    if (list == null || list.isEmpty()) js("error", "'no-speech'");
                    else js("result", new JSONArray(list).toString());
                    js("end", "null");
                }

                @Override public void onError(int code) {
                    String e;
                    switch (code) {
                        case SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS: e = "not-allowed"; break;
                        case SpeechRecognizer.ERROR_NO_MATCH:
                        case SpeechRecognizer.ERROR_SPEECH_TIMEOUT: e = "no-speech"; break;
                        case 12: // ERROR_LANGUAGE_NOT_SUPPORTED
                        case 13: // ERROR_LANGUAGE_UNAVAILABLE
                            e = "language-not-supported"; break;
                        case SpeechRecognizer.ERROR_CLIENT: e = "aborted"; break;
                        default: e = "network";
                    }
                    js("error", "'" + e + "'");
                    js("end", "null");
                }

                @Override public void onReadyForSpeech(Bundle b) { }
                @Override public void onBeginningOfSpeech() { }
                @Override public void onRmsChanged(float v) { }
                @Override public void onBufferReceived(byte[] b) { }
                @Override public void onEndOfSpeech() { }
                @Override public void onPartialResults(Bundle b) { }
                @Override public void onEvent(int i, Bundle b) { }
            });
        }
        Intent i = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        i.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        i.putExtra(RecognizerIntent.EXTRA_LANGUAGE, lang);
        i.putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, lang);
        i.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3);
        i.putExtra(RecognizerIntent.EXTRA_CALLING_PACKAGE, getPackageName());
        recognizer.cancel();
        recognizer.startListening(i);
    }

    /** Web sayfasından çağrılan yöntemler (window.AndroidSR). */
    private class Bridge {
        @JavascriptInterface
        public void start(final String lang) {
            runOnUiThread(() -> {
                if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
                    pendingLang = lang;
                    requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, REQ_MIC);
                } else listen(lang);
            });
        }

        @JavascriptInterface
        public void stop() {
            runOnUiThread(() -> { if (recognizer != null) recognizer.stopListening(); });
        }

        @JavascriptInterface
        public void saveBackup(final String json) {
            runOnUiThread(() -> {
                try {
                    if (Build.VERSION.SDK_INT >= 29) {
                        ContentValues cv = new ContentValues();
                        cv.put(MediaStore.Downloads.DISPLAY_NAME, "dil-ustasi-yedek.json");
                        cv.put(MediaStore.Downloads.MIME_TYPE, "application/json");
                        Uri u = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, cv);
                        try (OutputStream o = getContentResolver().openOutputStream(u)) { o.write(json.getBytes(StandardCharsets.UTF_8)); }
                        Toast.makeText(MainActivity.this, "Yedek İndirilenler klasörüne kaydedildi", Toast.LENGTH_LONG).show();
                    } else {
                        Intent i = new Intent(Intent.ACTION_SEND);
                        i.setType("text/plain");
                        i.putExtra(Intent.EXTRA_TEXT, json);
                        startActivity(Intent.createChooser(i, "Yedeği kaydet"));
                    }
                } catch (Exception e) {
                    Toast.makeText(MainActivity.this, "Yedek kaydedilemedi", Toast.LENGTH_LONG).show();
                }
            });
        }
    }
}

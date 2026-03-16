import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './layouts/Layout'
import { Home } from './pages/Home'
import { LoadingScreen } from './components/LoadingScreen'

const ImageConverterPage = lazy(() => import('./pages/tools/ImageConverterPage'))
const ImageCompressorPage= lazy(() => import('./pages/tools/ImageCompressorPage'))
const ImageEditorPage    = lazy(() => import('./pages/tools/ImageEditorPage'))
const BgRemoverPage      = lazy(() => import('./pages/tools/BgRemoverPage'))
const BatchConvertPage   = lazy(() => import('./pages/tools/BatchConvertPage'))
const PDFToImagePage     = lazy(() => import('./pages/tools/PDFToImagePage'))
const ImageToPDFPage     = lazy(() => import('./pages/tools/ImageToPDFPage'))
const PDFToWordPage      = lazy(() => import('./pages/tools/PDFToWordPage'))
const WordToPDFPage      = lazy(() => import('./pages/tools/WordToPDFPage'))
const MergePDFPage       = lazy(() => import('./pages/tools/MergePDFPage'))
const QRCodePage         = lazy(() => import('./pages/tools/QRCodePage'))
const Base64Page         = lazy(() => import('./pages/tools/Base64Page'))
const ResizeImagePage    = lazy(() => import('./pages/tools/ResizeImagePage'))
const CropImagePage      = lazy(() => import('./pages/tools/CropImagePage'))
const RotateImagePage    = lazy(() => import('./pages/tools/RotateImagePage'))
const FlipImagePage      = lazy(() => import('./pages/tools/FlipImagePage'))
const WatermarkImagePage = lazy(() => import('./pages/tools/WatermarkImagePage'))
const ImageMetadataPage  = lazy(() => import('./pages/tools/ImageMetadataPage'))
const ImageColorPickerPage = lazy(() => import('./pages/tools/ImageColorPickerPage'))
const ImageBlurPage      = lazy(() => import('./pages/tools/ImageBlurPage'))
const ImageSharpenPage   = lazy(() => import('./pages/tools/ImageSharpenPage'))
const ScreenshotToImagePage = lazy(() => import('./pages/tools/ScreenshotToImagePage'))

// new PDF tools
const SplitPDFPage          = lazy(() => import('./pages/tools/SplitPDFPage'))
const CompressPDFPage       = lazy(() => import('./pages/tools/CompressPDFPage'))
const RotatePDFPage         = lazy(() => import('./pages/tools/RotatePDFPage'))
const ReorderPDFPage        = lazy(() => import('./pages/tools/ReorderPDFPage'))
const ExtractImagesPDFPage  = lazy(() => import('./pages/tools/ExtractImagesPDFPage'))
const ProtectPDFPage        = lazy(() => import('./pages/tools/ProtectPDFPage'))
const UnlockPDFPage         = lazy(() => import('./pages/tools/UnlockPDFPage'))
const AddPageNumbersPDFPage = lazy(() => import('./pages/tools/AddPageNumbersPDFPage'))
const AddWatermarkPDFPage   = lazy(() => import('./pages/tools/AddWatermarkPDFPage'))
const PDFMetadataPage       = lazy(() => import('./pages/tools/PDFMetadataPage'))

// Utility tools
const QRGeneratorPage     = lazy(() => import('./pages/tools/QRGeneratorPage'))
const QRScannerPage       = lazy(() => import('./pages/tools/QRScannerPage'))
const ColorPickerPage     = lazy(() => import('./pages/tools/ColorPickerPage'))
const TextToSpeechPage    = lazy(() => import('./pages/tools/TextToSpeechPage'))
const SpeechToTextPage    = lazy(() => import('./pages/tools/SpeechToTextPage'))
const UUIDGenPage         = lazy(() => import('./pages/tools/UUIDGenPage'))
const PasswordGenPage     = lazy(() => import('./pages/tools/PasswordGenPage'))
const Base64TextPage      = lazy(() => import('./pages/tools/Base64TextPage'))
const JSONFormatterPage   = lazy(() => import('./pages/tools/JSONFormatterPage'))
const URLEncoderPage      = lazy(() => import('./pages/tools/URLEncoderPage'))

const W = (props) => {
  const { Component: C } = props
  return <Suspense fallback={<LoadingScreen />}><C /></Suspense>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="tools/image-converter"  element={<W Component={ImageConverterPage}  />} />
          <Route path="tools/image-compressor" element={<W Component={ImageCompressorPage} />} />
          <Route path="tools/image-editor"     element={<W Component={ImageEditorPage}     />} />
          <Route path="tools/bg-remover"       element={<W Component={BgRemoverPage}       />} />
          <Route path="tools/batch-convert"    element={<W Component={BatchConvertPage}    />} />
          <Route path="tools/pdf-to-image"     element={<W Component={PDFToImagePage}      />} />
          <Route path="tools/image-to-pdf"     element={<W Component={ImageToPDFPage}      />} />
          <Route path="tools/pdf-to-word"      element={<W Component={PDFToWordPage}       />} />
          <Route path="tools/word-to-pdf"      element={<W Component={WordToPDFPage}       />} />
          <Route path="tools/merge-pdf"        element={<W Component={MergePDFPage}        />} />
          <Route path="tools/qr-code"          element={<W Component={QRCodePage}          />} />
          <Route path="tools/base64"           element={<W Component={Base64Page}          />} />
          <Route path="tools/resize-image"     element={<W Component={ResizeImagePage}     />} />
          <Route path="tools/crop-image"       element={<W Component={CropImagePage}       />} />
          <Route path="tools/rotate-image"     element={<W Component={RotateImagePage}     />} />
          <Route path="tools/flip-image"       element={<W Component={FlipImagePage}       />} />
          <Route path="tools/watermark-image"  element={<W Component={WatermarkImagePage}  />} />
          <Route path="tools/image-metadata"   element={<W Component={ImageMetadataPage}   />} />
          <Route path="tools/color-picker"     element={<W Component={ImageColorPickerPage} />} />
          <Route path="tools/image-blur"       element={<W Component={ImageBlurPage}       />} />
          <Route path="tools/image-sharpen"    element={<W Component={ImageSharpenPage}    />} />
          <Route path="tools/screenshot"       element={<W Component={ScreenshotToImagePage} />} />

          <Route path="tools/split-pdf"          element={<W Component={SplitPDFPage}          />} />
          <Route path="tools/compress-pdf"       element={<W Component={CompressPDFPage}       />} />
          <Route path="tools/rotate-pdf"         element={<W Component={RotatePDFPage}         />} />
          <Route path="tools/reorder-pdf"        element={<W Component={ReorderPDFPage}        />} />
          <Route path="tools/extract-images-pdf" element={<W Component={ExtractImagesPDFPage}  />} />
          <Route path="tools/protect-pdf"        element={<W Component={ProtectPDFPage}        />} />
          <Route path="tools/unlock-pdf"         element={<W Component={UnlockPDFPage}         />} />
          <Route path="tools/add-page-numbers"   element={<W Component={AddPageNumbersPDFPage} />} />
          <Route path="tools/add-watermark-pdf"  element={<W Component={AddWatermarkPDFPage}   />} />
          <Route path="tools/pdf-metadata"       element={<W Component={PDFMetadataPage}       />} />

          {/* Utility tools */}
          <Route path="tools/qr-generator"     element={<W Component={QRGeneratorPage}     />} />
          <Route path="tools/qr-scanner"       element={<W Component={QRScannerPage}       />} />
          <Route path="tools/gen-color-picker" element={<W Component={ColorPickerPage}     />} />
          <Route path="tools/text-to-speech"   element={<W Component={TextToSpeechPage}    />} />
          <Route path="tools/speech-to-text"   element={<W Component={SpeechToTextPage}    />} />
          <Route path="tools/uuid-generator"   element={<W Component={UUIDGenPage}         />} />
          <Route path="tools/password-generator" element={<W Component={PasswordGenPage}   />} />
          <Route path="tools/base64-text"      element={<W Component={Base64TextPage}      />} />
          <Route path="tools/json-formatter"   element={<W Component={JSONFormatterPage}   />} />
          <Route path="tools/url-encoder"      element={<W Component={URLEncoderPage}      />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
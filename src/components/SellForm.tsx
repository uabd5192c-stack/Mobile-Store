import React, { useState, useRef } from "react";
import { motion } from "motion/react";
import { Camera, Send, Smartphone, CheckCircle2, X, Image as ImageIcon, Sparkles, Loader2 } from "lucide-react";
import { GoogleGenAI } from "@google/genai";

interface SellFormProps {
  whatsappNumber: string;
}

export default function SellForm({ whatsappNumber }: SellFormProps) {
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    condition: "Good",
    expectedPrice: "",
    description: "",
  });
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateAIImage = async () => {
    if (!formData.brand || !formData.model) {
      alert("Please enter brand and model first to generate an image.");
      return;
    }

    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: {
          parts: [
            {
              text: `A professional high-quality product photo of a ${formData.brand} ${formData.model} smartphone in ${formData.condition} condition. Clean white background, studio lighting, realistic details.`,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
          },
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const base64Data = part.inlineData.data;
          const imageUrl = `data:image/png;base64,${base64Data}`;
          setImages((prev) => [...prev, imageUrl]);
          break;
        }
      }
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Failed to generate image. Please try uploading manually.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages: string[] = [];
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalImages = [...images];
    if (finalImages.length === 0) {
      setIsGenerating(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-image",
          contents: {
            parts: [
              {
                text: `A professional high-quality product photo of a ${formData.brand} ${formData.model} smartphone in ${formData.condition} condition. Clean white background, studio lighting, realistic details.`,
              },
            ],
          },
          config: {
            imageConfig: {
              aspectRatio: "1:1",
            },
          },
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            const base64Data = part.inlineData.data;
            const imageUrl = `data:image/png;base64,${base64Data}`;
            finalImages = [imageUrl];
            setImages(finalImages);
            break;
          }
        }
      } catch (error) {
        console.error("Error generating image on submit:", error);
      } finally {
        setIsGenerating(false);
      }
    }

    const message = `Hi, I want to sell my phone:%0A- Brand: ${formData.brand}%0A- Model: ${formData.model}%0A- Condition: ${formData.condition}%0A- Expected Price: $${formData.expectedPrice}%0A- Description: ${formData.description}${finalImages.length > 0 ? `%0A%0A(I have attached ${finalImages.length} photos of the device)` : ""}`;
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto bg-white p-12 rounded-3xl shadow-xl text-center space-y-6 border border-slate-100"
      >
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-black text-slate-900">Request Sent!</h2>
        <p className="text-slate-500">
          We've received your request and opened WhatsApp to finalize the details. We'll get back to you with an offer soon!
        </p>
        <button
          onClick={() => setIsSubmitted(false)}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-colors"
        >
          Sell Another Phone
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div className="space-y-8">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Turn Your Old Phone <br />
              <span className="text-blue-600">Into Instant Cash.</span>
            </h2>
            <p className="text-slate-500 mt-4 text-lg">
              Fill out the form with your phone details. We offer the best market prices for used smartphones in any condition.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="font-bold">1</span>
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Enter Details</h4>
                <p className="text-sm text-slate-500">Provide brand, model, and condition of your device.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="font-bold">2</span>
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Get an Offer</h4>
                <p className="text-sm text-slate-500">Our experts will review and give you a competitive quote.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="font-bold">3</span>
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Instant Payment</h4>
                <p className="text-sm text-slate-500">Once verified, get paid instantly via your preferred method.</p>
              </div>
            </div>
          </div>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 space-y-6"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Brand</label>
              <input
                required
                type="text"
                placeholder="e.g. Apple"
                className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all border-transparent"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Model</label>
              <input
                required
                type="text"
                placeholder="e.g. iPhone 13"
                className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all border-transparent"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Condition</label>
            <select
              className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all border-transparent appearance-none"
              value={formData.condition}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
            >
              <option>Like New</option>
              <option>Good</option>
              <option>Fair</option>
              <option>Broken Screen</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Expected Price ($)</label>
            <input
              required
              type="number"
              placeholder="How much do you want?"
              className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all border-transparent"
              value={formData.expectedPrice}
              onChange={(e) => setFormData({ ...formData, expectedPrice: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Description / Issues</label>
            <textarea
              placeholder="Tell us more about the phone..."
              rows={3}
              className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all border-transparent resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Phone Photos</label>
            <div className="grid grid-cols-3 gap-3">
              {images.map((img, index) => (
                <div key={index} className="relative aspect-square rounded-xl overflow-hidden group">
                  <img src={img} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {images.length < 6 && (
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-all bg-slate-50"
                  >
                    <Camera className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-bold">Add Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={generateAIImage}
                    disabled={isGenerating || !formData.brand || !formData.model}
                    className="aspect-square rounded-xl border-2 border-dashed border-blue-200 flex flex-col items-center justify-center text-blue-400 hover:border-blue-500 hover:text-blue-500 transition-all bg-blue-50/50 disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-6 h-6 mb-1 animate-spin" />
                    ) : (
                      <Sparkles className="w-6 h-6 mb-1 group-hover:scale-110 transition-transform" />
                    )}
                    <span className="text-[10px] font-bold">AI Preview</span>
                  </button>
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              multiple
              accept="image/*"
              className="hidden"
            />
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Generating AI Preview...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" /> Submit Selling Request
              </>
            )}
          </button>
          <p className="text-center text-xs text-slate-400">
            By submitting, you agree to our terms for used device purchases.
          </p>
        </motion.form>
      </div>
    </div>
  );
}

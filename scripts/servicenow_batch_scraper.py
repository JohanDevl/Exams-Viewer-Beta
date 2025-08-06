#!/usr/bin/env python3
"""
Optimized batch scraper specifically for ServiceNow
Reads the manifest to retrieve all ServiceNow exams and processes them in a single pass
"""

import os
import sys
import json
import time
import random
import requests
import re
from bs4 import BeautifulSoup
from datetime import datetime
from collections import defaultdict

# Add the scripts directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from scraper import HEADERS, respectful_request, scrape_questions, save_json, load_json
from progress_manager import ProgressManager, LegacyProgressAdapter
from tqdm import tqdm


def load_servicenow_exams_from_manifest():
    """
    Loads all ServiceNow exams from the manifest
    """
    print("📋 Loading ServiceNow exams from manifest...")
    
    manifest_path = "public/data/manifest.json"
    if not os.path.exists(manifest_path):
        print("❌ Manifest not found")
        return []
    
    try:
        with open(manifest_path, 'r', encoding='utf-8') as f:
            manifest = json.load(f)
        
        exam_codes = [exam['code'] for exam in manifest.get('exams', [])]
        print(f"✅ Found {len(exam_codes)} ServiceNow exams in manifest")
        print(f"📝 Exams: {', '.join(sorted(exam_codes))}")
        
        return exam_codes
        
    except Exception as e:
        print(f"❌ Error reading manifest: {e}")
        return []

def batch_collect_servicenow_links(target_exam_codes, progress):
    """
    Collects all ServiceNow links in a single pass through pages
    Optimized to target only exams from the manifest
    """
    print(f"\n🚀 Batch collecting ServiceNow links for {len(target_exam_codes)} exams...")
    
    PREFIX = "https://www.examtopics.com/discussions/"
    SERVICENOW_CATEGORY = "servicenow"  # ServiceNow category on ExamTopics
    
    # Structure to collect links per exam
    exam_links = defaultdict(list)
    
    # Base URL for ServiceNow
    base_url = f"{PREFIX}{SERVICENOW_CATEGORY}/"
    
    # Get total number of ServiceNow pages
    response = respectful_request(base_url)
    if not response:
        raise Exception("Unable to access ServiceNow pages")
    
    soup = BeautifulSoup(response.content, "html.parser")
    page_indicator = soup.find("span", class_="discussion-list-page-indicator")
    if not page_indicator:
        raise Exception("Page indicator not found")
    
    strong_tags = page_indicator.find_all("strong")
    if len(strong_tags) < 2:
        raise Exception("Unexpected page indicator format")
    
    num_pages = int(strong_tags[1].text)
    print(f"📄 {num_pages} ServiceNow pages to analyze")
    
    # Convert target exam list to set for fast lookup
    target_exam_set = set(target_exam_codes)
    
    # Parcourir toutes les pages ServiceNow une seule fois
    for page_num in range(1, num_pages + 1):
        page_url = f"{base_url}{page_num}/"
        progress.progress(
            page_num / num_pages, 
            f"Analyzing page {page_num}/{num_pages} - Collecting ServiceNow links"
        )
        
        page_response = respectful_request(page_url)
        if not page_response:
            print(f"⚠️  Failed page {page_num}, moving to next")
            continue
        
        soup = BeautifulSoup(page_response.content, "html.parser")
        titles = soup.find_all("div", class_="dicussion-title-container")
        
        # Analyser chaque discussion sur cette page
        for title in titles:
            if not title.text:
                continue
            
            title_text = title.text.strip()
            
            # Chercher les patterns d'examens ServiceNow
            if "Exam " in title_text:
                # Extraire le code d'examen du titre (support des minuscules pour CIS-Discovery)
                exam_match = re.search(r'Exam\s+([A-Za-z0-9-]+)', title_text)
                if exam_match:
                    exam_code = exam_match.group(1)
                    
                    # Vérifier si c'est un des examens qu'on veut
                    if exam_code in target_exam_set:
                        a_tag = title.find("a")
                        if a_tag and "href" in a_tag.attrs:
                            link = a_tag["href"]
                            exam_links[exam_code].append(link)
        
        # Délai respectueux entre les pages
        if page_num < num_pages:
            delay = random.uniform(2, 4)
            time.sleep(delay)
    
    # Sort links for each exam by question number
    for exam_code in exam_links:
        exam_links[exam_code] = sorted(
            exam_links[exam_code], 
            key=lambda link: int(re.search(r'question-(\d+)', link).group(1)) if re.search(r'question-(\d+)', link) else 0
        )
    
    # Statistics
    total_links = sum(len(links) for links in exam_links.values())
    found_exams = len(exam_links)
    missing_exams = len(target_exam_set) - found_exams
    
    print(f"\n📊 Collection results:")
    print(f"   ✅ Exams found: {found_exams}/{len(target_exam_codes)}")
    print(f"   📝 Total links collected: {total_links}")
    
    if missing_exams > 0:
        missing_list = target_exam_set - set(exam_links.keys())
        print(f"   ⚠️  Exams not found: {', '.join(sorted(missing_list))}")
    
    return dict(exam_links), num_pages

def batch_collect_servicenow_links_with_progress(target_exam_codes, progress_manager):
    """
    Version améliorée avec barres de progression multi-niveaux
    Collecte tous les liens ServiceNow en un seul passage sur les pages
    """
    PREFIX = "https://www.examtopics.com/discussions/"
    SERVICENOW_CATEGORY = "servicenow"
    
    # Structure to collect links per exam
    exam_links = defaultdict(list)
    
    # Base URL for ServiceNow
    base_url = f"{PREFIX}{SERVICENOW_CATEGORY}/"
    
    # Get total number of ServiceNow pages
    response = respectful_request(base_url)
    if not response:
        raise Exception("Unable to access ServiceNow pages")
    
    soup = BeautifulSoup(response.content, "html.parser")
    page_indicator = soup.find("span", class_="discussion-list-page-indicator")
    if not page_indicator:
        raise Exception("Page indicator not found")
    
    strong_tags = page_indicator.find_all("strong")
    if len(strong_tags) < 2:
        raise Exception("Unexpected page indicator format")
    
    num_pages = int(strong_tags[1].text)
    
    # Convert target exam list to set for fast lookup
    target_exam_set = set(target_exam_codes)
    
    # Utiliser une sous-barre pour les pages
    with progress_manager.sub_progress(
        num_pages, 
        f"Collecting links from {num_pages} ServiceNow pages",
        "link_collection"
    ):
        # Go through all ServiceNow pages once
        for page_num in range(1, num_pages + 1):
            page_url = f"{base_url}{page_num}/"
            
            progress_manager.update_sub(f"Page {page_num}/{num_pages} - Analyzing...")
            
            page_response = respectful_request(page_url)
            if not page_response:
                progress_manager.update_sub(f"⚠️ Failed page {page_num}, moving to next")
                continue
            
            soup = BeautifulSoup(page_response.content, "html.parser")
            titles = soup.find_all("div", class_="dicussion-title-container")
            
            # Analyze each discussion on this page
            links_found_this_page = 0
            for title in titles:
                if not title.text:
                    continue
                
                title_text = title.text.strip()
                
                # Look for ServiceNow exam patterns
                if "Exam " in title_text:
                    # Extract exam code from title
                    exam_match = re.search(r'Exam\s+([A-Za-z0-9-]+)', title_text)
                    if exam_match:
                        exam_code = exam_match.group(1)
                        
                        # Check if this is one of the exams we want
                        if exam_code in target_exam_set:
                            a_tag = title.find("a")
                            if a_tag and "href" in a_tag.attrs:
                                link = a_tag["href"]
                                exam_links[exam_code].append(link)
                                links_found_this_page += 1
            
            if links_found_this_page > 0:
                progress_manager.update_sub(f"Page {page_num}/{num_pages} - {links_found_this_page} links found")
            
            # Respectful delay between pages
            if page_num < num_pages:
                delay = random.uniform(2, 4)
                time.sleep(delay)
    
    # Sort links for each exam by question number
    for exam_code in exam_links:
        exam_links[exam_code] = sorted(
            exam_links[exam_code], 
            key=lambda link: int(re.search(r'question-(\d+)', link).group(1)) 
            if re.search(r'question-(\d+)', link) else 0
        )
    
    # Statistics
    total_links = sum(len(links) for links in exam_links.values())
    found_exams = len(exam_links)
    missing_exams = len(target_exam_set) - found_exams
    
    progress_manager.print_phase_summary(
        "Link Collection",
        exams_found_count=found_exams,
        total_links_count=total_links,
        pages_analyzed_count=num_pages
    )
    
    if missing_exams > 0:
        missing_list = target_exam_set - set(exam_links.keys())
        print(f"   ⚠️  Exams not found: {', '.join(sorted(missing_list))}")
    
    return dict(exam_links), num_pages

def dispatch_servicenow_links(exam_links, target_exam_codes, total_pages):
    """
    Dispatches collected links to ServiceNow exam folders
    """
    print(f"\n📨 Dispatching ServiceNow links...")
    
    dispatched_count = 0
    updated_count = 0
    
    for exam_code in target_exam_codes:
        links = exam_links.get(exam_code, [])
        
        if not links:
            print(f"⚠️  {exam_code}: No links found")
            continue
        
        exam_dir = f"public/data/{exam_code}"
        os.makedirs(exam_dir, exist_ok=True)
        
        links_path = f"{exam_dir}/links.json"
        
        # Créer l'objet links.json optimisé
        links_obj = {
            "page_num": total_pages,
            "status": "complete", 
            "links": links,
            "collected_at": datetime.now().isoformat(),
            "method": "servicenow_batch_collection",
            "exam_code": exam_code,
            "links_count": len(links)
        }
        
        try:
            save_json(links_obj, links_path)
            
            # Vérifier si c'est une mise à jour ou création
            exam_json_path = f"{exam_dir}/exam.json"
            if os.path.exists(exam_json_path):
                updated_count += 1
                status = "updated"
            else:
                dispatched_count += 1
                status = "created"
            
            print(f"✅ {exam_code}: {len(links)} links → {status}")
            
        except Exception as e:
            print(f"❌ {exam_code}: Save error - {e}")
    
    print(f"\n📊 Dispatch summary:")
    print(f"   🆕 New exams: {dispatched_count}")
    print(f"   🔄 Updated exams: {updated_count}")
    
    return dispatched_count + updated_count

def dispatch_servicenow_links_with_progress(exam_links, target_exam_codes, total_pages, progress_manager):
    """
    Version améliorée avec barres de progression
    Dispatche les liens collectés vers les dossiers d'examens ServiceNow
    """
    dispatched_count = 0
    updated_count = 0
    
    # Utiliser une sous-barre pour le dispatch
    with progress_manager.sub_progress(len(target_exam_codes), "Dispatch des liens par examen"):
        
        for exam_code in target_exam_codes:
            links = exam_links.get(exam_code, [])
            
            if not links:
                progress_manager.update_sub(f"⚠️ {exam_code}: No links found")
                continue
            
            exam_dir = f"public/data/{exam_code}"
            os.makedirs(exam_dir, exist_ok=True)
            
            links_path = f"{exam_dir}/links.json"
            
            # Create optimized links.json object
            links_obj = {
                "page_num": total_pages,
                "status": "complete", 
                "links": links,
                "collected_at": datetime.now().isoformat(),
                "method": "servicenow_batch_collection",
                "exam_code": exam_code,
                "links_count": len(links)
            }
            
            try:
                save_json(links_obj, links_path)
                
                # Check if it's an update or creation
                exam_json_path = f"{exam_dir}/exam.json"
                if os.path.exists(exam_json_path):
                    updated_count += 1
                    status = "updated"
                else:
                    dispatched_count += 1
                    status = "created"
                
                progress_manager.update_sub(f"✅ {exam_code}: {len(links)} links → {status}")
                
            except Exception as e:
                progress_manager.update_sub(f"❌ {exam_code}: Save error - {e}")
    
    # Résumé de la phase
    progress_manager.print_phase_summary(
        "Link Dispatch",
        new_exams_count=dispatched_count,
        updated_exams_count=updated_count,
        total_exams_processed=len(target_exam_codes)
    )
    
    return dispatched_count + updated_count

def process_servicenow_questions(exam_codes, progress, force_update=False):
    """
    Processes questions for all ServiceNow exams
    """
    print(f"\n📝 Processing ServiceNow questions for {len(exam_codes)} exams...")
    
    results = []
    successful = 0
    failed = 0
    total_questions_processed = 0
    
    for i, exam_code in enumerate(exam_codes):
        print(f"\n📚 ServiceNow exam {i+1}/{len(exam_codes)}: {exam_code}")
        
        exam_dir = f"public/data/{exam_code}"
        links_path = f"{exam_dir}/links.json"
        questions_path = f"{exam_dir}/exam.json"
        
        # Charger les liens pré-collectés
        links_obj = load_json(links_path)
        if not links_obj or not links_obj.get("links"):
            print(f"❌ {exam_code}: Missing links")
            failed += 1
            continue
        
        links = links_obj["links"]
        print(f"📄 {len(links)} questions to process for {exam_code}")
        
        try:
            # Progress tracker spécifique à cet examen
            class ExamProgress:
                def __init__(self, exam_code):
                    self.exam_code = exam_code
                    
                def progress(self, value, text=""):
                    timestamp = datetime.now().strftime('%H:%M:%S')
                    print(f"[{timestamp}] {self.exam_code}: {text}")
            
            exam_progress = ExamProgress(exam_code)
            
            # Utiliser le scraper existant pour les questions
            questions_obj = scrape_questions(
                links, 
                questions_path, 
                exam_progress, 
                rapid_scraping=False,  # Mode respectueux
                force_update=force_update
            )
            
            questions = questions_obj.get("questions", [])
            error = questions_obj.get("error", "")
            
            if error:
                print(f"⚠️  {exam_code}: {error}")
                print(f"   📝 {len(questions)} questions retrieved despite error")
            
            result = {
                'exam_code': exam_code,
                'status': 'success' if not error else 'partial',
                'question_count': len(questions),
                'error': error if error else None
            }
            
            results.append(result)
            successful += 1
            total_questions_processed += len(questions)
            
            print(f"✅ {exam_code}: {len(questions)} questions processed successfully")
            
        except Exception as e:
            error_msg = str(e)
            print(f"❌ {exam_code}: Exception - {error_msg}")
            results.append({
                'exam_code': exam_code,
                'status': 'failed',
                'question_count': 0,
                'error': error_msg
            })
            failed += 1
        
        # Respectful pause between exams
        if i < len(exam_codes) - 1:
            print(f"⏳ 15s pause before next exam...")
            time.sleep(15)
    
    print(f"\n📊 Final ServiceNow summary:")
    print(f"   ✅ Successful exams: {successful}")
    print(f"   ❌ Failed exams: {failed}")
    print(f"   📝 Questions processed: {total_questions_processed}")
    
    return results

def process_servicenow_questions_with_progress(exam_codes, progress_manager, force_update=False):
    """
    Version améliorée avec barres de progression multi-niveaux
    Traite les questions pour tous les examens ServiceNow avec suivi détaillé
    """
    results = []
    successful = 0
    failed = 0
    total_questions_processed = 0
    
    for i, exam_code in enumerate(exam_codes):
        exam_dir = f"public/data/{exam_code}"
        links_path = f"{exam_dir}/links.json"
        questions_path = f"{exam_dir}/exam.json"
        
        # Charger les liens pré-collectés
        links_obj = load_json(links_path)
        if not links_obj or not links_obj.get("links"):
            progress_manager.update_sub(f"❌ {exam_code}: Missing links")
            failed += 1
            continue
        
        links = links_obj["links"]
        
        # Utiliser une sous-barre pour cet examen spécifique
        with progress_manager.sub_progress(
            len(links), 
            f"Examen {exam_code} ({len(links)} questions)", 
            "question_processing"
        ):
            
            try:
                # Créer un adaptateur pour maintenir la compatibilité avec scrape_questions
                legacy_adapter = LegacyProgressAdapter(progress_manager)
                
                # Utiliser le scraper existant pour les questions
                questions_obj = scrape_questions(
                    links, 
                    questions_path, 
                    legacy_adapter, 
                    rapid_scraping=False,  # Mode respectueux
                    force_update=force_update
                )
                
                questions = questions_obj.get("questions", [])
                error = questions_obj.get("error", "")
                update_stats = questions_obj.get("update_stats", {})
                
                if error:
                    tqdm.write(f"⚠️  {exam_code}: {error}")
                    tqdm.write(f"   📝 {len(questions)} questions retrieved despite error")
                
                # Display detailed update summary
                new_count = update_stats.get("new_count", 0)
                updated_count = update_stats.get("updated_count", 0)
                skipped_count = update_stats.get("skipped_count", 0)
                
                if new_count > 0 or updated_count > 0 or skipped_count > 0:
                    tqdm.write(f"\n📊 Update Summary:")
                    tqdm.write(f"   ✅ New questions added: {new_count}")
                    tqdm.write(f"   🔄 Existing questions updated: {updated_count}")
                    tqdm.write(f"   ⏭️  Questions skipped (no changes): {skipped_count}")
                    
                    status_msg = "updated successfully" if not error else "updated with errors"
                    tqdm.write(f"✅ {exam_code}: {len(questions)} questions {status_msg}")
                
                result = {
                    'exam_code': exam_code,
                    'status': 'success' if not error else 'partial',
                    'question_count': len(questions),
                    'error': error if error else None,
                    'update_stats': update_stats
                }
                
                results.append(result)
                successful += 1
                total_questions_processed += len(questions)
                
            except Exception as e:
                error_msg = str(e)
                progress_manager.update_sub(f"❌ {exam_code}: Exception - {error_msg}")
                results.append({
                    'exam_code': exam_code,
                    'status': 'failed',
                    'question_count': 0,
                    'error': error_msg
                })
                failed += 1
        
        # Mise à jour de la barre principale pour cet examen terminé
        progress_manager.update_main(f"Exam {exam_code} completed: {len(links)} questions")
        
        # Respectful pause between exams
        if i < len(exam_codes) - 1:
            time.sleep(15)
    
    # Calculate global update statistics
    total_new = sum(result.get('update_stats', {}).get('new_count', 0) for result in results)
    total_updated = sum(result.get('update_stats', {}).get('updated_count', 0) for result in results)
    total_skipped = sum(result.get('update_stats', {}).get('skipped_count', 0) for result in results)
    
    # Final questions summary with detailed stats if any updates occurred
    if total_new > 0 or total_updated > 0 or total_skipped > 0:
        tqdm.write(f"\n🎯 Global Update Summary:")
        tqdm.write(f"   ✅ Total new questions added: {total_new}")
        tqdm.write(f"   🔄 Total questions updated: {total_updated}")
        tqdm.write(f"   ⏭️  Total questions skipped: {total_skipped}")
        tqdm.write(f"   📊 Total questions processed: {total_questions_processed}")
    
    progress_manager.print_phase_summary(
        "Question Processing",
        successful_exams_count=successful,
        failed_exams_count=failed,
        total_questions_processed_count=total_questions_processed,
        total_new_count=total_new,
        total_updated_count=total_updated,
        total_skipped_count=total_skipped
    )
    
    return results

def main():
    """Main function for optimized ServiceNow scraper"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Optimized batch scraper for ServiceNow')
    parser.add_argument('--links-only', action='store_true', 
                        help='Link collection only')
    parser.add_argument('--questions-only', action='store_true',
                        help='Question processing only (uses existing links)')
    parser.add_argument('--force-update', action='store_true',
                        help='Force update of existing questions')
    parser.add_argument('--exam', type=str,
                        help='Process only a specific exam')
    
    args = parser.parse_args()
    
    print("🚀 Optimized ServiceNow Batch Scraper")
    print(f"⏰ {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("🎯 Targeting: ServiceNow exams from manifest")
    
    try:
        # Charger les examens ServiceNow du manifest
        target_exam_codes = load_servicenow_exams_from_manifest()
        if not target_exam_codes:
            print("❌ No ServiceNow exams found in manifest")
            return 1
        
        # Filtrer sur un examen spécifique si demandé
        if args.exam:
            if args.exam in target_exam_codes:
                target_exam_codes = [args.exam]
                print(f"🎯 Processing specific exam: {args.exam}")
            else:
                print(f"❌ Exam {args.exam} not found in ServiceNow manifest")
                print(f"📋 Available exams: {', '.join(sorted(target_exam_codes))}")
                return 1
        
        # Initialiser le gestionnaire de progression
        progress_manager = ProgressManager("ServiceNow Batch Scraper")
        
        # Calculer le nombre total d'étapes
        if args.questions_only:
            # Mode questions seulement: 1 étape (questions) + 1 étape (manifest)
            total_steps = len(target_exam_codes) + 1
            step_description = "Questions only mode"
        elif args.links_only:
            # Mode liens seulement: 2 étapes (collecte + dispatch)
            total_steps = 2
            step_description = "Links only mode"
        else:
            # Mode complet: 2 étapes fixes + N examens + 1 manifest
            total_steps = 2 + len(target_exam_codes) + 1
            step_description = "Complete scraping"
        
        print(f"📊 Planning {total_steps} steps for {len(target_exam_codes)} exams")
        
        # Lancer la barre de progression principale avec vraies barres imbriquées
        with progress_manager.main_progress(total_steps, step_description):
            
            if args.questions_only:
                # Traitement des questions uniquement
                print("📝 Mode: Questions only (pre-existing links)")
                results = process_servicenow_questions_with_progress(
                    target_exam_codes, progress_manager, args.force_update
                )
                
            else:
                # Phase 1: Collecte des liens
                exam_links, total_pages = batch_collect_servicenow_links_with_progress(
                    target_exam_codes, progress_manager
                )
                progress_manager.update_main("Phase 1: Link collection completed")
                
                if not exam_links:
                    print("❌ No ServiceNow links collected")
                    return 1
                
                # Phase 2: Dispatch des liens
                dispatched = dispatch_servicenow_links_with_progress(
                    exam_links, target_exam_codes, total_pages, progress_manager
                )
                progress_manager.update_main("Phase 2: Link dispatch completed")
                
                if not args.links_only:
                    # Phase 3: Traitement des questions
                    results = process_servicenow_questions_with_progress(
                        target_exam_codes, progress_manager, args.force_update
                    )
            
            # Update manifest if processing questions
            if not args.links_only:
                with progress_manager.sub_progress(len(target_exam_codes), "Updating manifest"):
                    try:
                        from update_manifest import update_single_exam_in_manifest
                        
                        updated_count = 0
                        failed_count = 0
                        
                        for exam_code in target_exam_codes:
                            if update_single_exam_in_manifest(exam_code):
                                updated_count += 1
                                progress_manager.update_sub(f"✅ Updated {exam_code}")
                            else:
                                failed_count += 1
                                progress_manager.update_sub(f"❌ Failed to update {exam_code}")
                        
                        if failed_count == 0:
                            progress_manager.print_phase_summary(
                                "Manifest Update",
                                updated_count=updated_count,
                                total_exams=len(target_exam_codes)
                            )
                        else:
                            progress_manager.print_phase_summary(
                                "Manifest Update",
                                updated_count=updated_count,
                                failed_count=failed_count,
                                total_exams=len(target_exam_codes)
                            )
                            
                    except Exception as e:
                        tqdm.write(f"⚠️  Manifest error: {str(e)}")
                
                progress_manager.update_main("Final phase: Manifest updated")
        
        # Final summary
        progress_manager.print_final_summary(
            total_exams=len(target_exam_codes),
            phases_completed=total_steps
        )
        
        return 0
        
    except Exception as e:
        print(f"❌ Fatal error: {str(e)}")
        return 1

if __name__ == "__main__":
    import sys
    sys.exit(main())